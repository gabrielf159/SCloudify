const {
  VITE_SPOTIFY_CLIENT_ID,
  VITE_SPOTIFY_REDIRECT_URI,
  VITE_SPOTIFY_SCOPES,
  VITE_SPOTIFY_AUTH_ENDPOINT
} = import.meta.env;

const scopes = encodeURIComponent(VITE_SPOTIFY_SCOPES || "");

const Login = () => {
  const handleLogin = () => {
    const authUrl = `${VITE_SPOTIFY_AUTH_ENDPOINT}?client_id=${VITE_SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(VITE_SPOTIFY_REDIRECT_URI)}&scope=${scopes}`;
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
