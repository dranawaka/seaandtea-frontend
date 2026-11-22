import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { FEATURE_TOURS_ENABLED } from '../config/features';

const Footer = () => {
  const year = new Date().getFullYear();
  const social = [
    { name: 'Facebook', icon: Facebook },
    { name: 'X', icon: Twitter },
    { name: 'Instagram', icon: Instagram },
    { name: 'LinkedIn', icon: Linkedin },
  ];

  return (
    <footer className="bg-primary-900 text-white">
      <div className="h-1 bg-accent-400" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="keep-light inline-block rounded-2xl bg-white px-3 py-2" aria-label="Sea & Tea home">
              <img src="/images/logo.png" alt="Sea & Tea" className="h-20 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-primary-100 leading-relaxed">
              Discover Sri Lanka through sea, tea, and local experiences. Tours with operators on the island, from tea country to the coast.
            </p>
            <div className="mt-6 flex gap-3">
              {social.map((item) => (
                <span
                  key={item.name}
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-primary-100"
                >
                  <item.icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/" className="text-primary-100 hover:text-white">Home</Link></li>
              <li><Link to="/guides" className="text-primary-100 hover:text-white">Guides</Link></li>
              {FEATURE_TOURS_ENABLED && (
                <li><Link to="/tours" className="text-primary-100 hover:text-white">Experiences</Link></li>
              )}
              <li><Link to="/shop" className="text-primary-100 hover:text-white">Shop</Link></li>
              {FEATURE_TOURS_ENABLED && (
                <li><Link to="/wishlist" className="text-primary-100 hover:text-white">Wishlist</Link></li>
              )}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">Contact</h3>
            <a href="mailto:info@seaandtea.com" className="mt-4 flex items-center gap-3 text-primary-100 hover:text-white">
              <Mail className="h-4 w-4 text-accent-300" />
              info@seaandtea.com
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-200">
              Questions about a guide, a tour, or an order go to the same inbox.
            </p>
            <Link to="/contact" className="mt-4 inline-flex text-sm font-semibold text-accent-300 hover:text-accent-200">
              Send a message
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-primary-200">
          <p>© {year} Sea & Tea. All rights reserved.</p>
          <p className="flex gap-4">
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
