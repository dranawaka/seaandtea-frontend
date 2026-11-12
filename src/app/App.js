import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FEATURE_TOURS_ENABLED } from '../shared/config/features';
import { AuthProvider } from '../shared/context/AuthContext';
import Navbar from '../shared/components/Navbar';
import Footer from '../shared/components/Footer';
import { Home, About, Contact } from '../modules/home';
import { Guides, GuideProfileViewer } from '../modules/guides';
import { Tours, GuideTours, CreateTour, TourDetail, Destination, Wishlist, Checkout } from '../modules/tours';
import { Shop } from '../modules/shop';
import { UserProfile } from '../modules/profile';
import { Login, Register } from '../modules/auth';
import { AdminDashboard, AdminEditGuide, AdminEditProduct, AdminNewsEdit } from '../modules/admin';
import { NewsPostDetail } from '../modules/news';
import { SitemapGenerator } from '../modules/seo';
import { Messages } from '../modules/messages';
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
              <Route path="/destinations/:slug" element={FEATURE_TOURS_ENABLED ? <Destination /> : <Navigate to="/" replace />} />
              <Route path="/wishlist" element={FEATURE_TOURS_ENABLED ? <Wishlist /> : <Navigate to="/" replace />} />
              <Route path="/checkout/:bookingId" element={FEATURE_TOURS_ENABLED ? <Checkout /> : <Navigate to="/" replace />} />
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