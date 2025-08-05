import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type SpotifyProfile = {
  display_name?: string;
  email?: string;
};

const Home = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("spotify_token");

  const logout = () => {
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_token_expires_in");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    const load = async () => {
      try {
        // --- Profile ---
        const meRes = await fetch("https://api.spotify.com/v1/me", { headers });
        const meText = await meRes.text();
        console.log("Profile status:", meRes.status, meText);
        if (!meRes.ok) {
          if (meRes.status === 401) logout();
          throw new Error(meText || "Failed to fetch profile");
        }
        const me = JSON.parse(meText);
        setProfile(me);

        // --- Playlists ---
        const plsRes = await fetch("https://api.spotify.com/v1/me/playlists?limit=50&offset=0", {
          headers,
        });
        const plsText = await plsRes.text();
        console.log("Playlists status:", plsRes.status, plsText);
        if (!plsRes.ok) {
          if (plsRes.status === 401) logout();
          throw new Error(plsText || "Failed to fetch playlists");
        }
        const pls = JSON.parse(plsText);
        setPlaylists(Array.isArray(pls.items) ? pls.items : []);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="p-6 text-center">
      <div className="flex justify-between items-center max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Welcome to Scloudify</h1>
        <button onClick={logout} className="text-sm underline">Log out</button>
      </div>

      {loading && <p className="mt-6">Loading playlists...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {profile && (
        <div className="mt-6">
          <p>
            Logged in as: <strong>{profile.display_name || "Unknown"}</strong>
          </p>
          <p className="text-gray-600">{profile.email || ""}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {playlists.length > 0 ? (
            <div className="mt-8 max-w-xl mx-auto text-left">
              <h2 className="text-xl font-semibold mb-3">Your Playlists</h2>
              <ul className="space-y-2">
                {playlists.map((p) => (
                  <li key={p.id} className="border rounded px-3 py-2">
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-8 text-gray-500">
              No playlists found. Create or follow a playlist in Spotify and refresh this page.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
