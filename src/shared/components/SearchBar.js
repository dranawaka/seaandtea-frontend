import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search } from 'lucide-react';

const SearchBar = ({ initialQuery = '', initialDate = '', showDate = false, onSubmit, className = '', variant = 'compact' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [date, setDate] = useState(initialDate);

  const hero = variant === 'hero';

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (showDate && date) params.set('date', date);
    if (onSubmit) onSubmit();
    navigate(`/tours${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <form onSubmit={submit} className={`flex items-center bg-white rounded-full ${hero ? 'keep-light p-1.5 pl-4 shadow-[0_10px_30px_rgba(8,18,32,0.18)]' : 'p-1 shadow-card border border-gray-200'} ${className}`}>
      <label className="flex-1 min-w-0 flex items-center pr-3">
        <Search className={`${hero ? 'h-5 w-5 text-primary-800' : 'h-4 w-4 text-primary-400'} mr-2.5 shrink-0`} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search experiences in Sri Lanka"
          className={`w-full bg-transparent text-ink placeholder:text-ink/40 focus:outline-none ${hero ? 'py-3 text-base' : 'py-2 text-sm'}`}
          aria-label="Search experiences in Sri Lanka"
        />
      </label>
      {showDate && (
        <label className="relative hidden sm:flex items-center border-l border-gray-200 pl-4 pr-3 text-sm text-ink/70">
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(event) => setDate(event.target.value)}
            className="hero-date w-[8.5rem] bg-transparent py-2 text-sm text-ink focus:outline-none"
            aria-label="Date"
          />
          <Calendar className="h-4 w-4 shrink-0 text-primary-800 pointer-events-none" />
        </label>
      )}
      <button type="submit" className={hero
        ? 'bg-accent-400 hover:bg-accent-500 text-primary-900 font-semibold px-7 py-3 text-base rounded-full transition-colors duration-200'
        : 'btn-primary px-5 py-2 text-sm'}>
        Search
      </button>
    </form>
  );
};

export default SearchBar;
