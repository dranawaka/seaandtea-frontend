import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { FEATURE_TOURS_ENABLED } from '../config/features';

const Footer = () => {
  return (
    <footer className="relative brand-hero text-white overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary-300 via-secondary-500 to-primary-300" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <Link to="/" className="keep-light inline-block mb-6 rounded-2xl bg-white px-4 py-3" aria-label="Sea & Tea home">
              <img src="/images/logo.png" alt="Sea & Tea" className="h-28 w-auto" />
            </Link>
            <p className="text-primary-100 mb-6 max-w-md leading-relaxed">
              Discover Sri Lanka through sea, tea, and local experiences. Tours with operators on the island, from tea country to the coast.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-3 bg-white/10 hover:bg-secondary-400 hover:text-primary-950 rounded-2xl transition-colors duration-200 text-primary-100">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 bg-white/10 hover:bg-secondary-400 hover:text-primary-950 rounded-2xl transition-colors duration-200 text-primary-100">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 bg-white/10 hover:bg-secondary-400 hover:text-primary-950 rounded-2xl transition-colors duration-200 text-primary-100">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 bg-white/10 hover:bg-secondary-400 hover:text-primary-950 rounded-2xl transition-colors duration-200 text-primary-100">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-primary-100 hover:text-secondary-300 hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-primary-100 hover:text-secondary-300 hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  Find Guides
                </Link>
              </li>
              {FEATURE_TOURS_ENABLED && (
                <li>
                  <Link to="/tours" className="text-primary-100 hover:text-secondary-300 hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                    Browse Tours
                  </Link>
                </li>
              )}
              <li>
                <Link to="/shop" className="text-primary-100 hover:text-secondary-300 hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-primary-100 hover:text-secondary-300 hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-100 hover:text-secondary-300 hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-100 hover:text-secondary-300 hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center group">
                <div className="p-2 bg-white/10 rounded-lg mr-3 group-hover:bg-white/20 transition-colors duration-200">
                  <Mail className="h-4 w-4 text-primary-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-primary-100 group-hover:text-secondary-200 transition-colors duration-300">info@seaandtea.com</span>
              </div>
              <div className="flex items-center group">
                <div className="p-2 bg-white/10 rounded-lg mr-3 group-hover:bg-white/20 transition-colors duration-200">
                  <Phone className="h-4 w-4 text-primary-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-primary-100 group-hover:text-secondary-200 transition-colors duration-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center group">
                <div className="p-2 bg-white/10 rounded-lg mr-3 group-hover:bg-white/20 transition-colors duration-200">
                  <MapPin className="h-4 w-4 text-primary-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-primary-100 group-hover:text-secondary-200 transition-colors duration-300">123 Travel Street, Adventure City, AC 12345</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-primary-200">
            © 2024 Sea & Tea. All rights reserved. |
            <Link to="/privacy" className="text-primary-100 hover:text-secondary-300 ml-2 transition-colors duration-300 font-medium">
              Privacy Policy
            </Link> |
            <Link to="/terms" className="text-primary-100 hover:text-secondary-300 ml-2 transition-colors duration-300 font-medium">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

