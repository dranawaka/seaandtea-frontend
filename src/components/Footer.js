import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-xl blur opacity-50"></div>
                <Globe className="h-10 w-10 text-primary-300 relative z-10" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-primary-300 to-secondary-300 bg-clip-text text-transparent">Sea & Tea</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Connecting travelers with local experts to create authentic and unforgettable experiences around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="group p-3 bg-white/10 hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm">
                <Facebook className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="#" className="group p-3 bg-white/10 hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm">
                <Twitter className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="#" className="group p-3 bg-white/10 hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm">
                <Instagram className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="#" className="group p-3 bg-white/10 hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm">
                <Linkedin className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  Find Guides
                </Link>
              </li>
              <li>
                <Link to="/tours" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  Browse Tours
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center group">
                <div className="p-2 bg-white/10 rounded-lg mr-3 group-hover:bg-gradient-to-r group-hover:from-primary-500 group-hover:to-secondary-500 transition-all duration-300">
                  <Mail className="h-4 w-4 text-primary-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">info@seaandtea.com</span>
              </div>
              <div className="flex items-center group">
                <div className="p-2 bg-white/10 rounded-lg mr-3 group-hover:bg-gradient-to-r group-hover:from-primary-500 group-hover:to-secondary-500 transition-all duration-300">
                  <Phone className="h-4 w-4 text-primary-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center group">
                <div className="p-2 bg-white/10 rounded-lg mr-3 group-hover:bg-gradient-to-r group-hover:from-primary-500 group-hover:to-secondary-500 transition-all duration-300">
                  <MapPin className="h-4 w-4 text-primary-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">123 Travel Street, Adventure City, AC 12345</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Sea & Tea. All rights reserved. | 
            <Link to="/privacy" className="text-gray-400 hover:text-primary-300 ml-2 transition-colors duration-300 font-medium">
              Privacy Policy
            </Link> | 
            <Link to="/terms" className="text-gray-400 hover:text-primary-300 ml-2 transition-colors duration-300 font-medium">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

