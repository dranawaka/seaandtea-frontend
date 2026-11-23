import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import AdminShell from '../components/AdminShell';
import GuideApprovalQueue from '../components/GuideApprovalQueue';

const FILTERS = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'VERIFIED', label: 'Verified' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'ALL', label: 'All' },
];

const AdminGuides = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('status');
  const status = FILTERS.some((filter) => filter.id === requested) ? requested : 'PENDING';

  return (
    <AdminShell
      title="Guides"
      description="Approve guides who are waiting, or review verified and rejected profiles."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setSearchParams(filter.id === 'PENDING' ? {} : { status: filter.id })}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              status === filter.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <GuideApprovalQueue token={token} status={status} />
    </AdminShell>
  );
};

export default AdminGuides;
