// App hosts ONLY the route table (router is provided in main.tsx)
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Playlist from "./pages/playlist";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/playlist/:id" element={<Playlist />} />
    </Routes>
  );
};

export default App;
