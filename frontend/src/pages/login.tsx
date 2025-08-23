import { useEffect, useState } from "react";
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
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Handle the redirect back from Spotify
  useEffect(() => {
    const codeFromSearch = new URLSearchParams(window.location.search).get("code");
    const codeFromHash = new URLSearchParams(window.location.hash.slice(1)).get("code");
    const code = codeFromSearch || codeFromHash;
    if (!code) return;

    const codeVerifier = localStorage.getItem("code_verifier") || "";
    if (!codeVerifier) {
      setErr("Missing PKCE verifier. Please try logging in again.");
      return;
    }

    const ac = new AbortController();

    (async () => {
      try {
        setBusy(true);
        setErr(null);
        const res = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: VITE_SPOTIFY_CLIENT_ID,
            grant_type: "authorization_code",
            code,
            redirect_uri: VITE_SPOTIFY_REDIRECT_URI,
            code_verifier: codeVerifier,
          }),
          signal: ac.signal,
        });

        const txt = await res.text();
        let json: any = {};
        try { json = JSON.parse(txt); } catch {}

        if (!res.ok || !json.access_token) {
          console.error("Token exchange failed:", res.status, json || txt);
          setErr("Spotify sign‑in failed. Please try again.");
          return;
        }

        localStorage.setItem("spotify_token", json.access_token);
        if (json.expires_in) localStorage.setItem("spotify_token_expires_in", String(json.expires_in));

        // Clean URL (remove code)
        window.history.replaceState(null, "", new URL(window.location.href).pathname);
        navigate("/", { replace: true });
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("Token fetch error:", e);
          setErr("Network error during sign‑in. Please retry.");
        }
      } finally {
        setBusy(false);
      }
    })();

    return () => ac.abort();
  }, [navigate]);

  const handleLogin = async () => {
    setErr(null);
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem("code_verifier", codeVerifier);

    const scopes =
      VITE_SPOTIFY_SCOPES ||
      "playlist-read-private playlist-read-collaborative user-read-email user-read-private";

    const authUrl =
      `${VITE_SPOTIFY_AUTH_ENDPOINT || "https://accounts.spotify.com/authorize"}` +
      `?client_id=${encodeURIComponent(VITE_SPOTIFY_CLIENT_ID)}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(VITE_SPOTIFY_REDIRECT_URI)}` +
      `&code_challenge_method=S256&code_challenge=${encodeURIComponent(codeChallenge)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&show_dialog=true`;

    window.location.href = authUrl;
  };

  return (
    <div className="text-center mt-20 p-6">
      <h2 className="text-2xl font-bold mb-4">Login with Spotify</h2>
      {err && <p className="text-red-600 mb-3">{err}</p>}
      <button
        onClick={handleLogin}
        disabled={busy}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {busy ? "Connecting..." : "Connect Spotify"}
      </button>
    </div>
  );
};

export default Login;
