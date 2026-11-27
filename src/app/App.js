import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FEATURE_TOURS_ENABLED, FEATURE_THINGS_TO_DO_ENABLED } from '../shared/config/features';
import { AuthProvider } from '../shared/context/AuthContext';
import { ThemeProvider } from '../shared/context/ThemeContext';
import Navbar from '../shared/components/Navbar';
import Footer from '../shared/components/Footer';
import { Home, About, Contact } from '../modules/home';
import { Guides, GuideProfileViewer, GuideDashboardPage } from '../modules/guides';
import { Tours, GuideTours, CreateTour, TourDetail, Destination, Wishlist, Checkout } from '../modules/tours';
import { Shop } from '../modules/shop';
import { UserProfile } from '../modules/profile';
import { Login, Register, OAuthCallback } from '../modules/auth';
import { AdminDashboard, AdminEditGuide, AdminEditProduct, AdminNewsEdit, AdminGuides, AdminUsers, AdminBookings } from '../modules/admin';
import { NewsPostDetail } from '../modules/news';
import { SitemapGenerator } from '../modules/seo';
import { Messages } from '../modules/messages';
import {
  ActivitiesList,
  ActivityCategory,
  ActivityDetail,
  EventDetail,
  EventsList,
  RestaurantDetail,
  RestaurantsList,
  ThingsInDestination,
  ThingsToDoHub
} from '../modules/thingstodo';
import './App.css';

const AdminThingsToDo = lazy(() => import('../modules/admin/pages/AdminThingsToDo'));
const AdminThingEdit = lazy(() => import('../modules/admin/pages/AdminThingEdit'));

const thing = (element) => (FEATURE_THINGS_TO_DO_ENABLED ? element : <Navigate to="/" replace />);

function App() {
  return (
    <ThemeProvider>
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
              <Route path="/guide/dashboard" element={<GuideDashboardPage />} />
              <Route path="/guide/tours" element={FEATURE_TOURS_ENABLED ? <GuideTours /> : <Navigate to="/" replace />} />
              <Route path="/guide-tours" element={FEATURE_TOURS_ENABLED ? <GuideTours /> : <Navigate to="/" replace />} />
              <Route path="/create-tour" element={FEATURE_TOURS_ENABLED ? <CreateTour /> : <Navigate to="/" replace />} />
              <Route path="/edit-tour/:id" element={FEATURE_TOURS_ENABLED ? <CreateTour /> : <Navigate to="/" replace />} />
              <Route path="/tour/:id" element={FEATURE_TOURS_ENABLED ? <TourDetail /> : <Navigate to="/" replace />} />
              <Route path="/destinations/:slug" element={FEATURE_TOURS_ENABLED ? <Destination /> : <Navigate to="/" replace />} />
              <Route path="/wishlist" element={FEATURE_TOURS_ENABLED ? <Wishlist /> : <Navigate to="/" replace />} />
              <Route path="/checkout/:bookingId" element={FEATURE_TOURS_ENABLED ? <Checkout /> : <Navigate to="/" replace />} />
              <Route path="/guide/:id" element={<GuideProfileViewer />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/guides" element={<AdminGuides />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/guide/:id/edit" element={<AdminEditGuide />} />
              <Route path="/admin/product/new" element={<AdminEditProduct />} />
              <Route path="/admin/product/:id/edit" element={<AdminEditProduct />} />
              <Route path="/admin/news/new" element={<AdminNewsEdit />} />
              <Route path="/admin/news/:id/edit" element={<AdminNewsEdit />} />
              <Route path="/news/:id" element={<NewsPostDetail />} />
              <Route path="/things-to-do" element={thing(<ThingsToDoHub />)} />
              <Route path="/things-to-do/activities" element={thing(<ActivitiesList />)} />
              <Route path="/things-to-do/activities/category/:category" element={thing(<ActivityCategory />)} />
              <Route path="/things-to-do/activities/:slug" element={thing(<ActivityDetail />)} />
              <Route path="/things-to-do/events" element={thing(<EventsList />)} />
              <Route path="/things-to-do/events/:slug" element={thing(<EventDetail />)} />
              <Route path="/things-to-do/restaurants" element={thing(<RestaurantsList />)} />
              <Route path="/things-to-do/restaurants/:slug" element={thing(<RestaurantDetail />)} />
              <Route path="/things-to-do/in/:destinationSlug" element={thing(<ThingsInDestination />)} />
              <Route path="/admin/things-to-do" element={thing(<Suspense fallback={<p className="p-8">Loading…</p>}><AdminThingsToDo /></Suspense>)} />
              <Route path="/admin/things-to-do/:type/new" element={thing(<Suspense fallback={<p className="p-8">Loading…</p>}><AdminThingEdit /></Suspense>)} />
              <Route path="/admin/things-to-do/:type/:id/edit" element={thing(<Suspense fallback={<p className="p-8">Loading…</p>}><AdminThingEdit /></Suspense>)} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/sitemap-generator" element={<SitemapGenerator />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
            </Routes>
          </main>
          <Footer />
        </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;