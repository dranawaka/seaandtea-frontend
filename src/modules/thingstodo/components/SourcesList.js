import React from 'react';

function checked(sources) {
  const dates = (sources || []).map((source) => source.accessedAt).filter(Boolean).sort();
  if (dates.length === 0) return null;
  return dates[dates.length - 1].slice(0, 10);
}

const SourcesList = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  const last = checked(sources);
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900">Sources</h2>
      {last && <p className="mt-2 text-sm text-gray-800">Last checked {last}</p>}
      <ul className="mt-3 space-y-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary-800 underline">
              {source.label || source.url}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SourcesList;
