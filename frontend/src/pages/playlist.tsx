import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatsCard from "../components/StatsCard";

const MAX_FEATURE_IDS = 100;

const Playlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [audioFeatures, setAudioFeatures] = useState<{ [id: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    if (!id) return;
    if (!token) {
      navigate("/login");
      return;
    }

    const ac = new AbortController();
    const headers = { Authorization: `Bearer ${token}` };
    const handle401 = () => {
      localStorage.removeItem("spotify_token");
      navigate("/login", { replace: true });
    };

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Playlist details
        const plRes = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
          headers,
          signal: ac.signal,
        });
        if (plRes.status === 401) return handle401();
        if (!plRes.ok) throw new Error(`Failed to load playlist: ${plRes.status}`);
        const pl = await plRes.json();
        setPlaylist(pl);

        // 2) All tracks (paginate), filter out items without track.id
        const allItems: any[] = (pl.tracks?.items ?? []).filter((it: any) => it?.track?.id);
        let next: string | null = pl.tracks?.next || null;
        while (next) {
          const pageRes = await fetch(next, { headers, signal: ac.signal });
          if (pageRes.status === 401) return handle401();
          if (!pageRes.ok) throw new Error(`Failed to load more tracks: ${pageRes.status}`);
          const page = await pageRes.json();
          const pageItems = (page.items ?? []).filter((it: any) => it?.track?.id);
          allItems.push(...pageItems);
          next = page.next || null;
        }
        setTracks(allItems);

        // 3) Audio features in chunks of 100
        const ids: string[] = allItems.map((it: any) => it.track.id);
        const featuresById: Record<string, any> = {};
        for (let i = 0; i < ids.length; i += MAX_FEATURE_IDS) {
          const chunk = ids.slice(i, i + MAX_FEATURE_IDS);
          if (!chunk.length) continue;

          const afRes = await fetch(
            `https://api.spotify.com/v1/audio-features?ids=${chunk.join(",")}`,
            { headers, signal: ac.signal }
          );
          if (afRes.status === 401) return handle401();
          if (!afRes.ok) throw new Error(`Failed to load audio features: ${afRes.status}`);
          const afData = await afRes.json();
          (afData.audio_features ?? []).forEach((f: any) => {
            if (f?.id) featuresById[f.id] = f;
          });
        }
        setAudioFeatures(featuresById);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error("Error loading playlist page:", e);
        setError("Failed to load playlist.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => ac.abort();
  }, [id, token, navigate]);

  // --- KPI averages from audioFeatures ---
  const kpis = useMemo(() => {
    const vals = Object.values(audioFeatures).filter(Boolean);
    const avg = (k: string) =>
      vals.length ? vals.reduce((s: number, v: any) => s + (v?.[k] ?? 0), 0) / vals.length : 0;
    return {
      danceability: avg("danceability"),
      energy: avg("energy"),
      valence: avg("valence"),
      tempo: avg("tempo"),
      haveData: vals.length > 0,
    };
  }, [audioFeatures]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm underline text-blue-600 hover:text-blue-800"
      >
        ← Back
      </button>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {!playlist && error && <p className="text-red-500 text-center">{error}</p>}

      {playlist && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={playlist.images?.[0]?.url || "/fallback.jpg"}
              alt={playlist.name}
              className="w-32 h-32 object-cover rounded"
            />
            <div>
              <h1 className="text-2xl font-bold">{playlist.name}</h1>
              <p className="text-gray-600">{playlist.description || "No description provided."}</p>
              <p className="text-sm text-gray-500 mt-1">{playlist.tracks?.total} tracks</p>
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}
      {!loading && !error && tracks.length > 0 && kpis.haveData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <StatsCard label="Danceability" value={kpis.danceability} />
          <StatsCard label="Energy" value={kpis.energy} />
          <StatsCard label="Valence" value={kpis.valence} />
          <StatsCard label="Tempo" value={kpis.tempo} suffix=" BPM" />
        </div>
      )}

      {!loading && tracks.length === 0 && !error && (
        <p className="text-center text-gray-500">No tracks found.</p>
      )}

      {tracks.length > 0 && (
        <div className="space-y-4">
          {tracks.map((item: any) => {
            const track = item.track;
            const features = audioFeatures[track.id];
            return (
              <div key={track.id} className="border rounded p-4 shadow hover:shadow-md transition bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{track.name}</p>
                    <p className="text-sm text-gray-600">
                      {track.artists.map((a: any) => a.name).join(", ")}
                    </p>
                  </div>
                  <img
                    src={track.album?.images?.[2]?.url || "/fallback.jpg"}
                    alt="album"
                    className="w-12 h-12 object-cover rounded"
                  />
                </div>
                {features ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <p>🎶 Danceability: {features.danceability}</p>
                    <p>⚡ Energy: {features.energy}</p>
                    <p>😊 Valence: {features.valence}</p>
                    <p>⏱ Tempo: {Math.round(features.tempo)} BPM</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">No audio features available.</p>
                )}
                {track.preview_url && (
                  <audio controls src={track.preview_url} className="mt-3 w-full" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Playlist;
