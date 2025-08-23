import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface SpotifyProfile {
  display_name?: string;
  email?: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: { total: number };
  images: { url: string }[];
}

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("spotify_token");

  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(!!token); // only load if token exists
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return; // no token → show login CTA instead of redirect

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

        // profile
        const meRes = await fetch("https://api.spotify.com/v1/me", {
          headers,
          signal: ac.signal,
        });
        if (meRes.status === 401) return handle401();
        if (!meRes.ok) throw new Error(`Failed to load profile: ${meRes.status}`);
        const me = await meRes.json();
        setProfile(me);

        // all playlists (paginate)
        let url: string | null = "https://api.spotify.com/v1/me/playlists?limit=50";
        const all: Playlist[] = [];
        while (url) {
          const plsRes = await fetch(url, { headers, signal: ac.signal });
          if (plsRes.status === 401) return handle401();
          if (!plsRes.ok) throw new Error(`Failed to load playlists: ${plsRes.status}`);
          const data = await plsRes.json();
          all.push(...(data.items || []));
          url = data.next; // absolute URL or null
        }
        setPlaylists(all);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error(e);
        setError(e?.message || "Unexpected error occurred.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => ac.abort();
  }, [token, navigate]);

  const logout = () => {
    localStorage.removeItem("spotify_token");
    navigate("/login");
  };

  // Header with conditional button
  const Header = (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Welcome to Scloudify</h1>
      {token ? (
        <button onClick={logout} className="text-sm underline text-red-600 hover:text-red-800">
          Log out
        </button>
      ) : (
        <button onClick={() => navigate("/login")} className="text-sm underline text-blue-600 hover:text-blue-800">
          Log in
        </button>
      )}
    </div>
  );

  // If no token, show a clean login CTA section
  if (!token) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        {Header}
        <div className="text-center mt-10">
          <p className="text-gray-600 mb-6">Sign in with Spotify to see your playlists.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
          >
            Log in with Spotify
          </button>
        </div>
      </div>
    );
  }

  // Token exists → normal content
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {Header}

      {profile && (
        <div className="mb-6 text-gray-700">
          <p>
            Logged in as: <strong>{profile.display_name || "Spotify User"}</strong>
          </p>
          {profile.email ? <p>{profile.email}</p> : null}
        </div>
      )}

      {loading && <div className="text-center text-gray-500 animate-pulse">Loading playlists...</div>}

      {error && <div className="text-center text-red-500 mt-4">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {playlists.map((p) => (
              <Link
                key={p.id}
                to={`/playlist/${p.id}`}
                className="block border rounded-lg overflow-hidden shadow hover:shadow-lg hover:scale-105 transition-transform bg-white"
              >
                <img
                  src={p.images?.[0]?.url || "/fallback.jpg"}
                  alt={p.name}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold truncate" title={p.name}>
                    {p.name}
                  </h2>
                  <p className="text-sm text-gray-600">Tracks: {p.tracks?.total ?? 0}</p>
                </div>
              </Link>
            ))}
          </div>

          {playlists.length === 0 && (
            <p className="mt-8 text-gray-500 text-center">No playlists found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
