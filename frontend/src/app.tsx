import { Link, Route, Routes } from 'react-router-dom';

import Compare from './pages/compare';
import Home from './pages/home';
import Login from './pages/login';

const App = () => {
  return (
    <div className="p-4">
      <nav className="flex gap-4 border-b pb-2 mb-4">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/compare">Compare</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </div>
  );
};

export default App;
