import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import GaragePage from "./pages/GaragePage";
import AddCarPage from "./pages/AddCarPage";
import EditCarPage from "./pages/EditCarPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-shell" >
       <header className="navbar">
        <h1 className="brand-title">APEX // Garage</h1>
          <nav className="nav-links">
            <Link to="/">Inventory</Link>
            <Link to="/add" className="btn-primary">Add Car</Link>
          </nav>
       </header>
        
        <main className="main-container">
          <Routes>
            <Route path="/" element={<GaragePage />} />
            <Route path="/add" element={<AddCarPage />} />
            <Route path="/edit/:id" element={<EditCarPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
      