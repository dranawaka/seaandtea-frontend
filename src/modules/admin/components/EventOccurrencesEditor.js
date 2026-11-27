import React from 'react';
import { DATE_STATUSES, pretty } from '../../thingstodo/utils/labels';

const empty = () => ({ year: new Date().getFullYear(), startDate: '', endDate: '', dateStatus: 'EXPECTED', statusSourceUrl: '', ticketUrl: '', notes: '' });

const EventOccurrencesEditor = ({ occurrences, onChange, error }) => {
  const update = (index, field, value) => {
    onChange(occurrences.map((item, row) => (row === index ? { ...item, [field]: value } : item)));
  };
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-900">Occurrences</legend>
      {error && <p id="occurrences-error" className="mt-1 text-sm text-red-700">{error}</p>}
      <div className="mt-2 space-y-3">
        {occurrences.map((item, index) => (
          <div key={item.id || index} className="grid gap-2 rounded-md border border-gray-200 p-3 md:grid-cols-3" aria-describedby={error ? 'occurrences-error' : undefined}>
            <label className="text-sm text-gray-900">Year
              <input className="mt-1 w-full rounded-md border px-3 py-2" type="number" value={item.year || ''} onChange={(event) => update(index, 'year', Number(event.target.value))} />
            </label>
            <label className="text-sm text-gray-900">Start
              <input className="mt-1 w-full rounded-md border px-3 py-2" type="date" value={item.startDate || ''} onChange={(event) => update(index, 'startDate', event.target.value)} />
            </label>
            <label className="text-sm text-gray-900">End
              <input className="mt-1 w-full rounded-md border px-3 py-2" type="date" value={item.endDate || ''} onChange={(event) => update(index, 'endDate', event.target.value)} />
            </label>
            <label className="text-sm text-gray-900">Status
              <select className="mt-1 w-full rounded-md border px-3 py-2" value={item.dateStatus || 'EXPECTED'} onChange={(event) => update(index, 'dateStatus', event.target.value)}>
                {DATE_STATUSES.map((status) => <option key={status} value={status}>{pretty(status)}</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-900 md:col-span-2">Source URL
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={item.statusSourceUrl || ''} onChange={(event) => update(index, 'statusSourceUrl', event.target.value)} />
            </label>
            <label className="text-sm text-gray-900 md:col-span-2">Ticket URL
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={item.ticketUrl || ''} onChange={(event) => update(index, 'ticketUrl', event.target.value)} />
            </label>
            <label className="text-sm text-gray-900 md:col-span-3">Notes
              <textarea className="mt-1 w-full rounded-md border px-3 py-2" value={item.notes || ''} onChange={(event) => update(index, 'notes', event.target.value)} />
            </label>
            <button type="button" className="text-left text-sm text-red-700 underline" onClick={() => onChange(occurrences.filter((_, row) => row !== index))}>Remove occurrence</button>
          </div>
        ))}
        <button type="button" className="btn-outline min-h-[44px]" onClick={() => onChange([...occurrences, empty()])}>Add occurrence</button>
      </div>
    </fieldset>
  );
};

export default EventOccurrencesEditor;
