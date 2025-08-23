import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Guides from './pages/Guides';
import Tours from './pages/Tours';
import About from './pages/About';
import Contact from './pages/Contact';
import Tea from './pages/Tea';
import Seas from './pages/Seas';
import GuideProfile from './pages/GuideProfile';
import UserProfile from './pages/UserProfile';
import GuideTours from './pages/GuideTours';
import TourDetail from './pages/TourDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/tea" element={<Tea />} />
              <Route path="/seas" element={<Seas />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/guide/:id" element={<GuideProfile />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/guide-profile" element={<GuideProfile />} />
          <Route path="/guide-tours" element={<GuideTours />} />
              <Route path="/tour/:id" element={<TourDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

