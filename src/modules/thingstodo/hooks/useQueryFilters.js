import { useSearchParams } from 'react-router-dom';

export function useQueryFilters(keys) {
  const [params, setParams] = useSearchParams();
  const values = {};
  keys.forEach((key) => {
    const all = params.getAll(key);
    values[key] = all.length > 1 ? all : (all[0] || '');
  });

  const setFilters = (next) => {
    const updated = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      updated.delete(key);
      if (Array.isArray(value)) {
        value.filter((item) => item !== undefined && item !== null && item !== '').forEach((item) => {
          updated.append(key, item);
        });
      } else if (value !== undefined && value !== null && value !== '' && value !== false) {
        updated.set(key, String(value));
      }
    });
    if (!Object.prototype.hasOwnProperty.call(next, 'page')) updated.delete('page');
    setParams(updated);
  };

  return { values, setFilters, params };
}
