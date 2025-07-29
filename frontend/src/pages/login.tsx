const {
  VITE_SPOTIFY_CLIENT_ID,
  VITE_SPOTIFY_REDIRECT_URI,
  VITE_SPOTIFY_SCOPES,
  VITE_SPOTIFY_AUTH_ENDPOINT
} = import.meta.env;

const scopes = encodeURIComponent(VITE_SPOTIFY_SCOPES || "");

// check if login is working
console.log("Spotify Client ID:", VITE_SPOTIFY_CLIENT_ID);
// check if redirect URI is working
const authUrl = `https://accounts.spotify.com/authorize?client_id=3e89f30e5c76425caa31edba493a350f&response_type=token&redirect_uri=http://127.0.0.1:5173&scope=user-read-private%20user-read-email`;


const Login = () => {
  const handleLogin = () => {
    const authUrl = `${VITE_SPOTIFY_AUTH_ENDPOINT ?? "https://accounts.spotify.com/authorize"}?client_id=${VITE_SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(VITE_SPOTIFY_REDIRECT_URI)}&scope=${scopes}`;
    // Redirect to Spotify authorization page
    window.location.href = authUrl;
  };

  return (
    <div className="text-center mt-20">
      <h2 className="text-2xl font-bold mb-4">Login with Spotify</h2>
      <button onClick={handleLogin} className="bg-green-500 text-white px-4 py-2 rounded">
        Connect Spotify
      </button>
    </div>
  );
};

export default Login;
