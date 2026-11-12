import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Waves, Leaf, User, LogIn, LogOut, UserCircle, Settings, Plus, MapPin, ChevronDown, Shield, MessageCircle, ShoppingBag, Heart } from 'lucide-react';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { getUnreadCountApi } from '../config/api';
import { FEATURE_TOURS_ENABLED } from '../config/features';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { isAuthenticated, user, token, logout } = useAuth();
  const profileDropdownRef = useRef(null);

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
    ...(FEATURE_TOURS_ENABLED ? [{ name: 'Explore', href: '/tours' }] : [{ name: 'Home', href: '/' }]),
    { name: 'Guides', href: '/guides' },
    { name: 'Shop', href: '/shop' },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
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
    <nav className="sticky top-0 z-50 border-b border-primary-100/80 bg-sand/90 backdrop-blur-xl shadow-[0_10px_30px_-22px_rgba(10,110,110,0.45)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 shadow-md shadow-primary-700/30">
              <Waves className="h-5 w-5 text-white" />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-500 ring-2 ring-sand">
                <Leaf className="h-3 w-3 text-white" />
              </span>
            </span>
            <span className="ml-3 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-ink">
              Sea and Tea
            </span>
          </Link>

          {FEATURE_TOURS_ENABLED && (
            <div className="hidden lg:block flex-1 max-w-xl mx-6">
              <SearchBar />
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-800 text-white shadow-md shadow-primary-900/20'
                        : 'text-stone-700 hover:text-primary-800 hover:bg-primary-50'
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
            {FEATURE_TOURS_ENABLED && (
              <Link
                to="/wishlist"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 hover:bg-secondary-300 text-primary-800 transition-all duration-200"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" strokeWidth={2} />
              </Link>
            )}
            <Link
              to="/shop?openCart=1"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 hover:bg-secondary-300 text-primary-800 transition-all duration-200"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={2} />
            </Link>
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
                  className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-gray-100"
                >
                  <LogIn className="h-5 w-5 inline mr-1.5" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  <User className="h-5 w-5 inline mr-1.5" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile: cart + menu */}
          <div className="md:hidden flex items-center space-x-3">
            <Link
              to="/shop?openCart=1"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 text-primary-800"
              aria-label="Shopping cart"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={2} />
            </Link>
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

