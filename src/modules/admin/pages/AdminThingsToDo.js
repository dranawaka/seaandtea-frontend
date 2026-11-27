import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminShell from '../components/AdminShell';
import { useAuth } from '../../../shared/context/AuthContext';
import { adminDeleteThing, adminListThings, adminPendingThings, adminSetThingStatus } from '../../../shared/config/api';
import { useAsync } from '../../thingstodo/hooks/useAsync';
import { pretty } from '../../thingstodo/utils/labels';

const TABS = [
  { id: 'activities', label: 'Activities' },
  { id: 'events', label: 'Events' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'pending', label: 'Pending' }
];

function typePath(row, tab) {
  if (tab !== 'pending') return tab;
  if (row.type === 'EVENT') return 'events';
  if (row.type === 'RESTAURANT') return 'restaurants';
  return 'activities';
}

function stale(value) {
  if (!value) return false;
  return Date.now() - new Date(value).getTime() > 180 * 24 * 60 * 60 * 1000;
}

const AdminThingsToDo = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState('activities');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const pending = useAsync((signal) => adminPendingThings(token), [token]);
  const list = useAsync(
    () => (tab === 'pending' ? Promise.resolve(null) : adminListThings(tab, { status, q, size: 50 }, token)),
    [tab, status, q, token]
  );
  const rows = tab === 'pending' ? (pending.data || []) : (list.data?.content || []);

  const run = async (action) => {
    try {
      await action();
      list.reload();
      pending.reload();
    } catch (error) {
      if (error.status === 401) {
        sessionStorage.setItem('postLoginPath', '/admin/things-to-do');
        window.location.assign('/login');
        return;
      }
      window.alert('That change could not be saved.');
    }
  };

  return (
    <AdminShell title="Things to do" description="Activities, events and restaurants">
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Catalogue">
        {TABS.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={`min-h-[44px] rounded-full px-4 ${tab === item.id ? 'bg-primary-800 text-white' : 'bg-white ring-1 ring-gray-300'}`} onClick={() => setTab(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      {tab !== 'pending' && (
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="text-sm font-medium text-gray-900" htmlFor="admin-q">Search
            <input id="admin-q" className="ml-2 rounded-md border px-3 py-2" value={q} onChange={(event) => setQ(event.target.value)} />
          </label>
          <label className="text-sm font-medium text-gray-900" htmlFor="admin-status">Status
            <select id="admin-status" className="ml-2 rounded-md border px-3 py-2" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All</option>
              {['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}
            </select>
          </label>
          <Link className="btn-primary inline-flex min-h-[44px] items-center" to={`/admin/things-to-do/${tab}/new`}>Add new</Link>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full text-left text-sm text-gray-900">
          <thead>
            <tr className="border-b">
              <th className="p-3">Title</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Needs check</th>
              <th>Last verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.type}-${row.id}`} className="border-b">
                <td className="p-3 font-medium">{row.title}</td>
                <td>{row.destination}</td>
                <td><span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold">{pretty(row.status)}</span></td>
                <td>{row.needsVerification ? 'Yes' : 'No'}</td>
                <td className={stale(row.lastVerifiedAt) ? 'font-semibold text-red-700' : ''}>{row.lastVerifiedAt ? String(row.lastVerifiedAt).slice(0, 10) : '—'}</td>
                <td className="space-x-2 py-2">
                  <Link className="underline" to={`/admin/things-to-do/${typePath(row, tab)}/${row.id}/edit`}>Edit</Link>
                  {tab !== 'pending' && (
                    <>
                      <button type="button" className="underline" onClick={() => run(() => adminSetThingStatus(tab, row.id, { status: 'PUBLISHED' }, token))}>Publish</button>
                      <button type="button" className="underline" onClick={() => run(() => adminSetThingStatus(tab, row.id, { status: 'ARCHIVED' }, token))}>Archive</button>
                      <button type="button" className="underline text-red-700" onClick={() => { if (window.confirm('Delete this item?')) run(() => adminDeleteThing(tab, row.id, token)); }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};

export default AdminThingsToDo;
