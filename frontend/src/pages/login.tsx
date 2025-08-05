import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const {
  VITE_SPOTIFY_CLIENT_ID,
  VITE_SPOTIFY_REDIRECT_URI,
  VITE_SPOTIFY_SCOPES,
  VITE_SPOTIFY_AUTH_ENDPOINT,
} = import.meta.env;

// --- PKCE helpers ---
function generateRandomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}
async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const Login = () => {
  const navigate = useNavigate();

  // Handle the redirect back from Spotify
  useEffect(() => {
    // Spotify may return code in ?code=... OR #code=...
    const codeFromSearch = new URLSearchParams(window.location.search).get("code");
    const codeFromHash = new URLSearchParams(window.location.hash.slice(1)).get("code");
    const code = codeFromSearch || codeFromHash;
    console.log("OAuth code:", code);

    if (!code) return;

    const codeVerifier = localStorage.getItem("code_verifier") || "";
    console.log("Using code_verifier:", codeVerifier ? "(exists)" : "(missing)");

    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: VITE_SPOTIFY_CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: VITE_SPOTIFY_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    })
      .then(async (res) => {
        const txt = await res.text();
        console.log("Token response status:", res.status, txt);
        try {
          return { ok: res.ok, json: JSON.parse(txt) };
        } catch {
          return { ok: res.ok, json: {} as any };
        }
      })
      .then(({ ok, json }) => {
        if (!ok || !json.access_token) {
          console.error("Token exchange failed:", json);
          return;
        }
        localStorage.setItem("spotify_token", json.access_token);
        // optional: store expiry if you want to refresh later
        if (json.expires_in) localStorage.setItem("spotify_token_expires_in", String(json.expires_in));

        // Clean URL
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/");
      })
      .catch((err) => console.error("Token fetch error:", err));
  }, [navigate]);

  const handleLogin = async () => {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem("code_verifier", codeVerifier);

    const scopes =
      VITE_SPOTIFY_SCOPES ||
      "playlist-read-private playlist-read-collaborative user-read-email user-read-private";

    const authUrl =
      `${(VITE_SPOTIFY_AUTH_ENDPOINT || "https://accounts.spotify.com/authorize")}` +
      `?client_id=${encodeURIComponent(VITE_SPOTIFY_CLIENT_ID)}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(VITE_SPOTIFY_REDIRECT_URI)}` +
      `&code_challenge_method=S256&code_challenge=${encodeURIComponent(codeChallenge)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&show_dialog=true`; // force re-consent so scopes are granted

    console.log("Auth URL:", authUrl);
    window.location.href = authUrl;
  };

  return (
    <div className="text-center mt-20">
      <h2 className="text-2xl font-bold mb-4">Login with Spotify</h2>
      <button onClick={handleLogin} className="bg-green-600 text-white px-4 py-2 rounded">
        Connect Spotify
      </button>
    </div>
  );
};

export default Login;
