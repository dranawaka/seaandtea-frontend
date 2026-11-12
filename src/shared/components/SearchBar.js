import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

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
    <form onSubmit={submit} className={`flex items-center gap-2 bg-white rounded-full shadow-card border border-primary-100 ${hero ? 'p-2' : 'p-1.5'} ${className}`}>
      <label className="flex-1 min-w-0 flex items-center px-3">
        <Search className={`${hero ? 'h-5 w-5' : 'h-4 w-4'} text-primary-600 mr-2 shrink-0`} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search experiences in Sri Lanka"
          className={`w-full bg-transparent text-ink placeholder:text-ink/40 focus:outline-none ${hero ? 'py-3 text-base' : 'py-2 text-sm'}`}
          aria-label="Search experiences in Sri Lanka"
        />
      </label>
      {showDate && (
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split('T')[0]}
          onChange={(event) => setDate(event.target.value)}
          className="hidden sm:block border-l border-primary-100 px-3 py-2 text-sm text-ink focus:outline-none bg-transparent"
          aria-label="Date"
        />
      )}
      <button type="submit" className={`btn-primary ${hero ? 'px-6 py-3 text-base' : 'px-5 py-2 text-sm'}`}>
        Search
      </button>
    </form>
  );
};

export default SearchBar;
