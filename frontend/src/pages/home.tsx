
const Home = () => {
  return (
    <div className="text-center mt-10">
      <h1 className="text-4xl font-bold mb-6">Welcome to Scloudify 🎧</h1>
      <p className="mb-4 text-lg">Compare your Spotify & SoundCloud playlists!</p>
      <a
        href="https://accounts.spotify.com/authorize?client_id=YOUR_SPOTIFY_CLIENT_ID&response_type=code&redirect_uri=http://localhost:5173&scope=playlist-read-private%20user-read-email"
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded"
      >
        Login with Spotify
      </a>
    </div>
  );
};

export default Home;
