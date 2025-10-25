import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthPages from "./pages/AuthPages";
import Explore from "./pages/Explore";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";

function App() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPages />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
