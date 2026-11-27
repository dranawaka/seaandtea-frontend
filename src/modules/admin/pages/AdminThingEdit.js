import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminShell from '../components/AdminShell';
import EventOccurrencesEditor from '../components/EventOccurrencesEditor';
import MonthPicker from '../components/MonthPicker';
import SourcesEditor from '../components/SourcesEditor';
import ImagePicker from '../../../shared/components/ImagePicker';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  adminCreateThing,
  adminGetThing,
  adminSetThingStatus,
  adminUpdateThing,
  listThingsDestinations,
  uploadThingImage
} from '../../../shared/config/api';
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_REGIONS,
  CUISINES,
  DIFFICULTIES,
  DIETARY,
  EVENT_TYPES,
  PRICE_TIERS,
  RECURRENCE,
  TRADITIONS,
  pretty,
  slugify
} from '../../thingstodo/utils/labels';

const blank = (type) => {
  const shared = { slug: '', summary: '', description: '', destinationSlug: '', heroImageUrl: '', seoTitle: '', seoDescription: '', needsVerification: '', status: 'DRAFT', sources: [], latitude: '', longitude: '' };
  if (type === 'events') {
    return { ...shared, name: '', type: 'CULTURAL', tradition: 'SECULAR', recurrenceType: 'TYPICAL_MONTH', typicalStartMonth: '', typicalEndMonth: '', venueName: '', officialUrl: '', etiquetteNote: '', crowdNote: '', free: false, occurrences: [] };
  }
  if (type === 'restaurants') {
    return { ...shared, name: '', cuisines: [], priceTier: 'MID', addressLine: '', neighbourhood: '', phone: '', openingHoursText: '', dietary: [], googlePlaceId: '', guideTip: '', reservationsEmail: '' };
  }
  return { ...shared, title: '', category: 'HIKING', region: 'HILL_COUNTRY', yearRound: false, difficulty: 'ALL_LEVELS', seasonMonths: [], peakMonths: [], seasonNote: '', feesNote: '', responsibleTravelNote: '', officialUrl: '', seasonalAlternativeSlug: '' };
};

function dateOnly(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function fromEntity(type, entity) {
  const sources = (entity.sources || []).map((source) => ({ url: source.url, label: source.label || '', kind: source.kind || 'PRIMARY' }));
  const destinationSlug = entity.destination?.slug || entity.destinationSlug || '';
  const base = { ...blank(type), ...entity, destinationSlug, sources, heroImageUrl: entity.heroImageUrl || '' };
  if (type === 'activities') {
    const rows = entity.seasonMonths || [];
    const objects = rows.length > 0 && typeof rows[0] === 'object';
    base.seasonMonths = objects ? rows.filter((row) => row.inSeason !== false).map((row) => row.month) : rows;
    base.peakMonths = objects ? rows.filter((row) => row.peak).map((row) => row.month) : (entity.peakMonths || []);
    base.seasonalAlternativeSlug = entity.seasonalAlternativeSlug || '';
  }
  if (type === 'events') {
    base.occurrences = (entity.occurrences || []).map((item) => ({
      id: item.id,
      year: item.year,
      startDate: dateOnly(item.startDate),
      endDate: dateOnly(item.endDate),
      dateStatus: item.dateStatus,
      statusSourceUrl: item.statusSourceUrl || '',
      ticketUrl: item.ticketUrl || '',
      notes: item.notes || ''
    }));
  }
  if (type === 'restaurants') {
    base.cuisines = entity.cuisines || [];
    base.dietary = entity.dietary || [];
  }
  return base;
}

function payload(type, form) {
  const sources = (form.sources || []).filter((source) => source.url).map((source) => ({ url: source.url, label: source.label, kind: source.kind || 'PRIMARY' }));
  const shared = {
    slug: form.slug,
    summary: form.summary,
    description: form.description,
    destinationSlug: form.destinationSlug,
    heroImageUrl: form.heroImageUrl || null,
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    needsVerification: form.needsVerification,
    status: form.status || 'DRAFT',
    sources,
    latitude: form.latitude === '' ? null : Number(form.latitude),
    longitude: form.longitude === '' ? null : Number(form.longitude)
  };
  if (type === 'events') {
    return {
      ...shared,
      name: form.name,
      type: form.type,
      tradition: form.tradition,
      recurrenceType: form.recurrenceType,
      typicalStartMonth: form.typicalStartMonth ? Number(form.typicalStartMonth) : null,
      typicalEndMonth: form.typicalEndMonth ? Number(form.typicalEndMonth) : null,
      venueName: form.venueName,
      officialUrl: form.officialUrl,
      etiquetteNote: form.etiquetteNote,
      crowdNote: form.crowdNote,
      free: Boolean(form.free),
      occurrences: (form.occurrences || []).map((item) => ({
        ...item,
        year: Number(item.year),
        startDate: item.startDate || null,
        endDate: item.endDate || null
      }))
    };
  }
  if (type === 'restaurants') {
    return {
      ...shared,
      name: form.name,
      cuisines: form.cuisines || [],
      priceTier: form.priceTier,
      addressLine: form.addressLine,
      neighbourhood: form.neighbourhood,
      phone: form.phone,
      openingHoursText: form.openingHoursText,
      dietary: form.dietary || [],
      googlePlaceId: form.googlePlaceId,
      guideTip: form.guideTip,
      reservationsEmail: form.reservationsEmail
    };
  }
  return {
    ...shared,
    title: form.title,
    category: form.category,
    region: form.region,
    yearRound: Boolean(form.yearRound),
    difficulty: form.difficulty,
    seasonMonths: form.seasonMonths || [],
    peakMonths: form.peakMonths || [],
    seasonNote: form.seasonNote,
    feesNote: form.feesNote,
    responsibleTravelNote: form.responsibleTravelNote,
    officialUrl: form.officialUrl,
    seasonalAlternativeSlug: form.seasonalAlternativeSlug
  };
}

const Field = ({ id, label, children, error }) => (
  <label className="block text-sm font-medium text-gray-900" htmlFor={id}>
    {label}
    {children}
    {error && <span id={`${id}-error`} className="mt-1 block text-sm text-red-700">{error}</span>}
  </label>
);

const inputClass = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2';

const AdminThingEdit = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isNew = !id || id === 'new';
  const [form, setForm] = useState(() => blank(type));
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [markVerified, setMarkVerified] = useState(false);
  const [savedId, setSavedId] = useState(isNew ? null : id);

  useEffect(() => {
    listThingsDestinations().then(setPlaces).catch(() => setPlaces([]));
  }, []);

  useEffect(() => {
    if (isNew) return undefined;
    let active = true;
    adminGetThing(type, id, token)
      .then((entity) => {
        if (!active) return;
        if (!entity) {
          setMessage('Item not found.');
          return;
        }
        setForm(fromEntity(type, entity));
      })
      .catch((error) => {
        if (error.status === 401) {
          sessionStorage.setItem('postLoginPath', window.location.pathname);
          navigate('/login');
          return;
        }
        if (active) setMessage('The item could not be loaded.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, isNew, navigate, token, type]);

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const title = type === 'activities' ? form.title : form.name;
  const hasSource = (form.sources || []).some((source) => source.url);

  const validate = (publishing) => {
    const next = {};
    if (!title) next.title = 'A name is required';
    if (!form.slug || !/^[a-z0-9-]{1,120}$/.test(form.slug)) next.slug = 'Use lowercase letters, numbers and hyphens';
    if (!form.destinationSlug) next.destinationSlug = 'Choose a destination';
    if ((form.summary || '').length > 300) next.summary = 'Summary must be 300 characters or fewer';
    (form.occurrences || []).forEach((item) => {
      if (item.dateStatus === 'CONFIRMED' && !item.startDate) next.occurrences = 'A confirmed occurrence needs a start date';
      if (item.startDate && item.endDate && item.startDate > item.endDate) next.occurrences = 'The start date must be on or before the end date';
    });
    if (publishing && !hasSource) next.sources = 'Add at least one source before publishing';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async (publishing) => {
    if (!validate(publishing)) return;
    setSaving(true);
    setMessage('');
    try {
      const body = payload(type, { ...form, status: publishing ? form.status : (form.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT') });
      if (!publishing) body.status = 'DRAFT';
      const saved = isNew && !savedId
        ? await adminCreateThing(type, body, token)
        : await adminUpdateThing(type, savedId || id, body, token);
      const nextId = saved?.id || savedId || id;
      setSavedId(nextId);
      if (publishing) {
        await adminSetThingStatus(type, nextId, { status: 'PUBLISHED', markVerified }, token);
      } else if (markVerified) {
        await adminSetThingStatus(type, nextId, { status: body.status || 'DRAFT', markVerified: true }, token);
      }
      setMessage(publishing ? 'Published.' : 'Saved as draft.');
      if (isNew) navigate(`/admin/things-to-do/${type}/${nextId}/edit`, { replace: true });
    } catch (error) {
      if (error.status === 401) {
        sessionStorage.setItem('postLoginPath', window.location.pathname);
        navigate('/login');
        return;
      }
      setMessage(error.status === 409 ? 'That slug is already used.' : 'The item could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title={isNew ? 'New item' : 'Edit item'} description={pretty(type)}>
      <Link to="/admin/things-to-do" className="mb-4 inline-flex items-center text-sm font-semibold text-primary-800">
        <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" /> Back
      </Link>
      {loading ? <p>Loading…</p> : (
        <form className="space-y-4 rounded-xl bg-white p-5" onSubmit={(event) => { event.preventDefault(); save(false); }}>
          {message && <p className="text-sm text-gray-900" role="status">{message}</p>}
          {form.needsVerification && <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-gray-900">{form.needsVerification}</p>}
          <Field id="thing-title" label={type === 'activities' ? 'Title' : 'Name'} error={errors.title}>
            <input id="thing-title" aria-describedby={errors.title ? 'thing-title-error' : undefined} className={inputClass} value={title || ''} onChange={(event) => {
              const value = event.target.value;
              set(type === 'activities' ? 'title' : 'name', value);
              if (!form.slug) set('slug', slugify(value));
            }} />
          </Field>
          <Field id="thing-slug" label="Slug" error={errors.slug}>
            <input id="thing-slug" aria-describedby={errors.slug ? 'thing-slug-error' : undefined} className={inputClass} value={form.slug} onChange={(event) => set('slug', event.target.value)} />
          </Field>
          <Field id="thing-destination" label="Destination" error={errors.destinationSlug}>
            <select id="thing-destination" className={inputClass} value={form.destinationSlug} onChange={(event) => set('destinationSlug', event.target.value)}>
              <option value="">Choose</option>
              {places.map((place) => <option key={place.slug} value={place.slug}>{place.name}</option>)}
            </select>
          </Field>
          <Field id="thing-summary" label="Summary" error={errors.summary}>
            <textarea id="thing-summary" className={inputClass} maxLength={300} value={form.summary || ''} onChange={(event) => set('summary', event.target.value)} />
          </Field>
          <Field id="thing-description" label="Description">
            <textarea id="thing-description" className={inputClass} rows={8} value={form.description || ''} onChange={(event) => set('description', event.target.value)} />
          </Field>
          {type === 'activities' && (
            <>
              <Field id="thing-category" label="Category">
                <select id="thing-category" className={inputClass} value={form.category} onChange={(event) => set('category', event.target.value)}>
                  {ACTIVITY_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>
              <Field id="thing-region" label="Region">
                <select id="thing-region" className={inputClass} value={form.region} onChange={(event) => set('region', event.target.value)}>
                  {ACTIVITY_REGIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Field>
              <Field id="thing-difficulty" label="Difficulty">
                <select id="thing-difficulty" className={inputClass} value={form.difficulty || ''} onChange={(event) => set('difficulty', event.target.value)}>
                  {DIFFICULTIES.map((item) => <option key={item} value={item}>{pretty(item)}</option>)}
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-gray-900">
                <input type="checkbox" checked={Boolean(form.yearRound)} onChange={(event) => set('yearRound', event.target.checked)} />
                Year round
              </label>
              <MonthPicker seasonMonths={form.seasonMonths || []} peakMonths={form.peakMonths || []} onChange={(next) => setForm((current) => ({ ...current, ...next }))} />
            </>
          )}
          {type === 'events' && (
            <>
              <Field id="thing-type" label="Type">
                <select id="thing-type" className={inputClass} value={form.type} onChange={(event) => set('type', event.target.value)}>
                  {EVENT_TYPES.map((item) => <option key={item} value={item}>{pretty(item)}</option>)}
                </select>
              </Field>
              <Field id="thing-tradition" label="Tradition">
                <select id="thing-tradition" className={inputClass} value={form.tradition} onChange={(event) => set('tradition', event.target.value)}>
                  {TRADITIONS.map((item) => <option key={item} value={item}>{pretty(item)}</option>)}
                </select>
              </Field>
              <Field id="thing-recurrence" label="Recurrence">
                <select id="thing-recurrence" className={inputClass} value={form.recurrenceType} onChange={(event) => set('recurrenceType', event.target.value)}>
                  {RECURRENCE.map((item) => <option key={item} value={item}>{pretty(item)}</option>)}
                </select>
              </Field>
              <EventOccurrencesEditor occurrences={form.occurrences || []} error={errors.occurrences} onChange={(occurrences) => set('occurrences', occurrences)} />
            </>
          )}
          {type === 'restaurants' && (
            <>
              <Field id="thing-tier" label="Price tier">
                <select id="thing-tier" className={inputClass} value={form.priceTier} onChange={(event) => set('priceTier', event.target.value)}>
                  {PRICE_TIERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>
              <Field id="thing-cuisine" label="Cuisine">
                <select id="thing-cuisine" className={inputClass} value={(form.cuisines || [])[0] || ''} onChange={(event) => set('cuisines', event.target.value ? [event.target.value] : [])}>
                  <option value="">Choose</option>
                  {CUISINES.map((item) => <option key={item} value={item}>{pretty(item)}</option>)}
                </select>
              </Field>
              <div className="flex flex-wrap gap-2">
                {DIETARY.map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-gray-900">
                    <input type="checkbox" checked={(form.dietary || []).includes(value)} onChange={() => {
                      const current = form.dietary || [];
                      set('dietary', current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
                    }} />
                    {label}
                  </label>
                ))}
              </div>
              <Field id="thing-address" label="Address">
                <input id="thing-address" className={inputClass} value={form.addressLine || ''} onChange={(event) => set('addressLine', event.target.value)} />
              </Field>
              <Field id="thing-phone" label="Phone">
                <input id="thing-phone" className={inputClass} value={form.phone || ''} onChange={(event) => set('phone', event.target.value)} />
              </Field>
            </>
          )}
          <SourcesEditor sources={form.sources || []} onChange={(sources) => set('sources', sources)} />
          {errors.sources && <p className="text-sm text-red-700">{errors.sources}</p>}
          <ImagePicker
            value={form.heroImageUrl ? [form.heroImageUrl] : []}
            onChange={(urls) => set('heroImageUrl', urls[0] || '')}
            maxFiles={1}
            enableUpload={Boolean(savedId)}
            onUpload={savedId ? (file) => uploadThingImage(type, savedId, file, token) : null}
            label="Image"
          />
          <label className="flex items-center gap-2 text-sm text-gray-900">
            <input type="checkbox" checked={markVerified} onChange={(event) => setMarkVerified(event.target.checked)} />
            Mark as verified today
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-outline min-h-[44px]" disabled={saving}>Save as draft</button>
            <button type="button" className="btn-primary min-h-[44px]" disabled={saving || !hasSource} onClick={() => save(true)}>Publish</button>
          </div>
        </form>
      )}
    </AdminShell>
  );
};

export default AdminThingEdit;
