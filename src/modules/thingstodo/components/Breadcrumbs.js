import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({ items, tone = 'dark' }) => (
  <nav aria-label="Breadcrumb" className={tone === 'light' ? 'text-white' : 'text-gray-800'}>
    <ol className="flex flex-wrap gap-2 text-sm text-gray-800">
      {items.map((item, index) => (
        <li key={item.label} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden="true">/</span>}
          {item.to && index < items.length - 1 ? (
            <Link to={item.to} className={`underline focus-visible:ring-2 focus-visible:ring-primary-500 ${tone === 'light' ? 'text-white' : ''}`}>{item.label}</Link>
          ) : (
            <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
