import React from 'react';

const FilterBar = ({ activeCount = 0, open, onOpenChange, onClear, children }) => {
  const fields = (
    <div className="space-y-4">
      {children}
      <div className="sticky bottom-0 flex gap-2 bg-white py-2">
        <button type="button" className="btn-outline min-h-[44px]" onClick={onClear}>
          Clear
        </button>
        <button type="button" className="btn-primary min-h-[44px] lg:hidden" onClick={() => onOpenChange(false)}>
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="btn-outline mb-4 min-h-[44px] lg:hidden"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        Filters ({activeCount})
      </button>
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-auto rounded-t-2xl border border-gray-200 bg-white p-4 shadow-2xl lg:hidden">
          {fields}
        </div>
      )}
      <aside className="hidden w-64 shrink-0 lg:block">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">Filters</h2>
        {fields}
      </aside>
    </>
  );
};

export function Chip({ pressed, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-[44px] rounded-full px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-500 ${
        pressed ? 'bg-primary-800 text-white' : 'bg-white text-gray-900 ring-1 ring-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export default FilterBar;
