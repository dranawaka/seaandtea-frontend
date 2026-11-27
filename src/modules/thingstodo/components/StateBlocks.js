import React from 'react';

export function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="h-40 animate-pulse bg-gray-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, action }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-white px-6 py-12 text-center" role="alert">
      <h2 className="text-lg font-semibold text-gray-900">We could not load this page</h2>
      <p className="mt-2 text-gray-800">Please try again in a moment.</p>
      {onRetry && (
        <button type="button" className="btn-primary mt-4" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
