import React from 'react';
import { NavLink } from 'react-router-dom';

const TABS = [
  { href: '/things-to-do/activities', label: 'Activities' },
  { href: '/things-to-do/events', label: 'Events' },
  { href: '/things-to-do/restaurants', label: 'Restaurants' }
];

const ThingsTabs = () => (
  <nav aria-label="Things to do" className="mb-6 flex flex-wrap gap-2">
    {TABS.map((tab) => (
      <NavLink
        key={tab.href}
        to={tab.href}
        className={({ isActive }) =>
          `min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary-500 ${
            isActive ? 'bg-primary-800 text-white' : 'bg-white text-gray-900 ring-1 ring-gray-300'
          }`
        }
      >
        {tab.label}
      </NavLink>
    ))}
  </nav>
);

export default ThingsTabs;
