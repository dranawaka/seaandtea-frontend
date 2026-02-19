import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FEATURE_TOURS_ENABLED } from './config/features';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Guides from './pages/Guides';
import Tours from './pages/Tours';
import About from './pages/About';
import Contact from './pages/Contact';
import Shop from './pages/Shop';
import UserProfile from './pages/UserProfile';
import GuideTours from './pages/GuideTours';
import CreateTour from './pages/CreateTour';
import TourDetail from './pages/TourDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './components/AdminDashboard';
import AdminEditGuide from './pages/AdminEditGuide';
import AdminEditProduct from './pages/AdminEditProduct';
import AdminNewsEdit from './pages/AdminNewsEdit';
import NewsPostDetail from './pages/NewsPostDetail';
import SitemapGenerator from './pages/SitemapGenerator';
import GuideProfileViewer from './components/GuideProfileViewer';
import Messages from './pages/Messages';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/tours" element={FEATURE_TOURS_ENABLED ? <Tours /> : <Navigate to="/" replace />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/guide-profile" element={<UserProfile />} />
              <Route path="/guide-tours" element={FEATURE_TOURS_ENABLED ? <GuideTours /> : <Navigate to="/" replace />} />
              <Route path="/create-tour" element={FEATURE_TOURS_ENABLED ? <CreateTour /> : <Navigate to="/" replace />} />
              <Route path="/edit-tour/:id" element={FEATURE_TOURS_ENABLED ? <CreateTour /> : <Navigate to="/" replace />} />
              <Route path="/tour/:id" element={FEATURE_TOURS_ENABLED ? <TourDetail /> : <Navigate to="/" replace />} />
              <Route path="/guide/:id" element={<GuideProfileViewer />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/guide/:id/edit" element={<AdminEditGuide />} />
              <Route path="/admin/product/new" element={<AdminEditProduct />} />
              <Route path="/admin/product/:id/edit" element={<AdminEditProduct />} />
              <Route path="/admin/news/new" element={<AdminNewsEdit />} />
              <Route path="/admin/news/:id/edit" element={<AdminNewsEdit />} />
              <Route path="/news/:id" element={<NewsPostDetail />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/sitemap-generator" element={<SitemapGenerator />} />
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

