import React from 'react';

const empty = () => ({ url: '', label: '', kind: 'PRIMARY' });

const SourcesEditor = ({ sources, onChange }) => {
  const update = (index, field, value) => {
    const next = sources.map((source, item) => (item === index ? { ...source, [field]: value } : source));
    onChange(next);
  };
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-900">Sources</legend>
      <div className="mt-2 space-y-3">
        {sources.map((source, index) => (
          <div key={index} className="grid gap-2 rounded-md border border-gray-200 p-3 md:grid-cols-4">
            <label className="text-sm text-gray-900 md:col-span-2">
              URL
              <input aria-label={`Source ${index + 1} URL`} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={source.url} onChange={(event) => update(index, 'url', event.target.value)} />
            </label>
            <label className="text-sm text-gray-900">
              Label
              <input aria-label={`Source ${index + 1} label`} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={source.label || ''} onChange={(event) => update(index, 'label', event.target.value)} />
            </label>
            <label className="text-sm text-gray-900">
              Kind
              <select aria-label={`Source ${index + 1} kind`} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" value={source.kind || 'PRIMARY'} onChange={(event) => update(index, 'kind', event.target.value)}>
                <option value="PRIMARY">Primary</option>
                <option value="SECONDARY">Secondary</option>
              </select>
            </label>
            <button type="button" className="text-left text-sm text-red-700 underline" onClick={() => onChange(sources.filter((_, item) => item !== index))}>Remove source</button>
          </div>
        ))}
        <button type="button" className="btn-outline min-h-[44px]" onClick={() => onChange([...sources, empty()])}>Add source</button>
      </div>
    </fieldset>
  );
};

export default SourcesEditor;
