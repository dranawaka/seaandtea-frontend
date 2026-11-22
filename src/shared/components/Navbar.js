import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, UserCircle, Settings, Plus, MapPin, ChevronDown, Shield, MessageCircle, ShoppingBag, Heart } from 'lucide-react';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { getUnreadCountApi } from '../config/api';
import { FEATURE_TOURS_ENABLED, FEATURE_SITE_PAYMENTS } from '../config/features';
import { TOUR_CATEGORIES } from '../data/destinations';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { isAuthenticated, user, token, logout } = useAuth();
  const location = useLocation();
  const profileDropdownRef = useRef(null);
  const exploreRef = useRef(null);
  const exploreActive = location.pathname.startsWith('/tours')
    || location.pathname.startsWith('/tour')
    || location.pathname.startsWith('/destinations');

  useEffect(() => {
    if (isAuthenticated && token) {
      getUnreadCountApi(token)
        .then((res) => setUnreadMessages(res.unreadCount ?? 0))
        .catch(() => setUnreadMessages(0));
    } else {
      setUnreadMessages(0);
    }
  }, [isAuthenticated, token]);

  const navigation = [
    { name: 'Guides', href: '/guides' },
    { name: 'Shop', href: '/shop' },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(event.target)) {
        setExploreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-3 py-2.5">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Sea & Tea home">
            <img
              src="/images/logo.png"
              alt="Sea & Tea"
              className="h-12 w-auto sm:h-14 dark:hidden"
            />
            <img
              src="/images/logo-on-dark.png"
              alt=""
              className="hidden h-12 w-auto sm:h-14 dark:block"
            />
          </Link>

          {FEATURE_TOURS_ENABLED && (
            <div className="hidden lg:block flex-1 max-w-md mx-4">
              <SearchBar />
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-2 flex items-center">
              {FEATURE_TOURS_ENABLED ? (
                <div className="relative" ref={exploreRef}>
                  <button
                    type="button"
                    onClick={() => setExploreOpen((open) => !open)}
                    className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold ${
                      exploreActive || exploreOpen ? 'text-primary-900' : 'text-primary-700 hover:text-primary-900'
                    }`}
                    aria-expanded={exploreOpen}
                    aria-haspopup="true"
                  >
                    Explore
                    <ChevronDown className={`h-4 w-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {exploreOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl z-50">
                      <Link
                        to="/tours"
                        className="block px-4 py-2.5 text-sm font-semibold text-primary-900 hover:bg-sand"
                        onClick={() => setExploreOpen(false)}
                      >
                        All experiences
                      </Link>
                      {TOUR_CATEGORIES.map((category) => (
                        <Link
                          key={category.value}
                          to={`/tours?category=${category.value}`}
                          className="block px-4 py-2 text-sm text-primary-800 hover:bg-sand"
                          onClick={() => setExploreOpen(false)}
                        >
                          {category.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-semibold ${isActive ? 'text-primary-900' : 'text-primary-700 hover:text-primary-900'}`
                  }
                >
                  Home
                </NavLink>
              )}
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'text-primary-900'
                        : 'text-primary-700 hover:text-primary-900'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Auth Buttons + Cart */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <span className="hidden lg:block h-6 w-px bg-gray-200" aria-hidden="true" />
            {FEATURE_TOURS_ENABLED && (
              <Link
                to="/wishlist"
                className="flex items-center justify-center w-9 h-9 text-primary-800 hover:text-primary-600 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" strokeWidth={1.75} />
              </Link>
            )}
            {FEATURE_SITE_PAYMENTS && (
            <Link
              to="/shop?openCart=1"
              className="flex items-center justify-center w-9 h-9 text-primary-800 hover:text-primary-600 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            )}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                >
                  {user?.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border-2 border-primary-200"
                    />
                  ) : (
                    <UserCircle className="h-5 w-5 text-primary-600" />
                  )}
                  <span>{user?.firstName || user?.email || 'User'}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 glass rounded-2xl shadow-2xl py-2 z-50 border border-white/20 animate-fade-in animate-scale-in">
                    {/* User Info */}
                    <div className="px-5 py-4 border-b border-white/10 bg-gray-50 rounded-t-2xl">
                      <div className="flex items-center space-x-3">
                        {user?.profilePictureUrl ? (
                          <img
                            src={user.profilePictureUrl}
                            alt="Profile"
                            className="h-12 w-12 rounded-full object-cover border-2 border-primary-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                          <p className="text-xs text-primary-600 font-medium capitalize mt-1">
                            {user?.role || 'User'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Management */}
                    <div className="py-1">
                      {user?.role === 'GUIDE' ? (
                        <Link
                          to="/profile"
                          className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200 rounded-lg mx-2"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          My Profile
                        </Link>
                      ) : (
                        <Link
                          to="/profile"
                          className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200 rounded-lg mx-2"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          My Profile
                        </Link>
                      )}
                      <Link
                        to="/messages"
                        className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <MessageCircle className="h-4 w-4 mr-3" />
                        Inbox
                        {unreadMessages > 0 && (
                          <span className="ml-auto rounded-full bg-primary-600 text-white text-xs font-semibold min-w-[1.25rem] h-5 flex items-center justify-center px-1.5">
                            {unreadMessages > 99 ? '99+' : unreadMessages}
                          </span>
                        )}
                      </Link>
                      {user?.role === 'GUIDE' && FEATURE_TOURS_ENABLED && (
                        <>
                      <Link
                        to="/guide-tours"
                        className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                            <MapPin className="h-4 w-4 mr-3" />
                            My Tours
                          </Link>
                          <Link
                            to="/create-tour"
                            className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200 rounded-lg mx-2"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Plus className="h-4 w-4 mr-3" />
                            Create New Tour
                          </Link>
                        </>
                      )}

                      {/* Admin Section */}
                      {user?.role === 'ADMIN' && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <div className="px-4 py-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</p>
                          </div>
                          <Link
                            to="/admin"
                            className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200 rounded-lg mx-2"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Shield className="h-4 w-4 mr-3" />
                            Admin Dashboard
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-white/10 py-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-lg mx-2 font-semibold"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center text-primary-800 hover:text-primary-600 px-2 py-2 text-sm font-semibold"
                >
                  <User className="h-4 w-4 mr-1.5" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary inline-flex items-center text-sm py-2 px-4"
                >
                  <User className="h-4 w-4 mr-1.5" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile: cart + menu */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            {FEATURE_SITE_PAYMENTS && (
            <Link
              to="/shop?openCart=1"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-primary-800"
              aria-label="Shopping cart"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={2} />
            </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {FEATURE_TOURS_ENABLED && (
        <div className="lg:hidden px-4 pb-3">
          <SearchBar onSubmit={() => setIsOpen(false)} />
        </div>
      )}

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass border-t border-white/20 backdrop-blur-xl">
            {FEATURE_TOURS_ENABLED ? (
              <Link
                to="/tours"
                className="text-gray-700 hover:text-primary-600 block px-4 py-3 rounded-xl text-base font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Explore
              </Link>
            ) : (
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 block px-4 py-3 rounded-xl text-base font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            )}
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-primary-600 block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {FEATURE_TOURS_ENABLED && (
              <Link
                to="/wishlist"
                className="text-gray-700 hover:text-primary-600 block px-4 py-3 rounded-xl text-base font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Wishlist
              </Link>
            )}
            <div className="pt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-3 py-2">
                    {user?.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border-2 border-primary-200"
                      />
                    ) : (
                      <UserCircle className="h-5 w-5 text-primary-600" />
                    )}
                    <span className="text-base font-medium text-gray-700">
                      {user?.firstName || user?.email || 'User'}
                    </span>
                  </div>
                  
                  {/* Profile Management */}
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    My Profile
                  </Link>
                  <Link
                    to="/messages"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4 inline mr-2" />
                    Inbox
                    {unreadMessages > 0 && (
                      <span className="ml-2 rounded-full bg-primary-600 text-white text-xs font-semibold px-1.5">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                  </Link>
                  {user?.role === 'GUIDE' && (
                    <>
                      <Link
                        to="/guide-profile"
                        className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-4 w-4 inline mr-2" />
                        Guide Profile
                      </Link>
                      {FEATURE_TOURS_ENABLED && (
                        <>
                          <Link
                            to="/guide-tours"
                            className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <MapPin className="h-4 w-4 inline mr-2" />
                            My Tours
                          </Link>
                          <Link
                            to="/create-tour"
                            className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <Plus className="h-4 w-4 inline mr-2" />
                            Create New Tour
                          </Link>
                        </>
                      )}
                    </>
                  )}

                  {/* Admin Section - Mobile */}
                  {user?.role === 'ADMIN' && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="px-3 py-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</p>
                      </div>
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="h-4 w-4 inline mr-2" />
                        Admin Dashboard
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    <LogOut className="h-5 w-5 inline mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary block text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

