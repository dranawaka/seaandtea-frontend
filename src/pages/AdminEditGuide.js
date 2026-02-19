import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { buildApiUrl, API_CONFIG, getGuideProfileById } from '../config/api';
import { useAuth } from '../context/AuthContext';

const AdminEditGuide = () => {
  const { id: guideId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    bio: '',
    hourlyRate: '',
    dailyRate: '',
    responseTimeHours: '24',
    isAvailable: true,
    specialties: [],
    languages: []
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/admin');
      return;
    }
    if (!guideId || !token) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getGuideProfileById(guideId, token);
        if (cancelled) return;
        setGuide(data);
        setForm({
          bio: data.bio || '',
          hourlyRate: data.hourlyRate != null ? String(data.hourlyRate) : '',
          dailyRate: data.dailyRate != null ? String(data.dailyRate) : '',
          responseTimeHours: data.responseTimeHours != null ? String(data.responseTimeHours) : '24',
          isAvailable: data.isAvailable !== false,
          specialties: (data.specialties || []).map(s => typeof s === 'string' ? s : (s.specialty || '')),
          languages: (data.languages || []).map(l => typeof l === 'string' ? l : (l.language || ''))
        });
      } catch (err) {
        if (!cancelled) setMessage({ type: 'error', text: err.message || 'Failed to load guide' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, guideId, token, navigate]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleArrayChange = (field, index, value) => {
    setForm(prev => {
      const arr = [...(prev[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field) => {
    setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  };

  const removeArrayItem = (field, index) => {
    setForm(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const next = {};
    if (!(form.bio || '').trim()) next.bio = 'Bio is required';
    else if (form.bio.trim().length < 50) next.bio = 'Bio must be at least 50 characters';
    if (form.hourlyRate === '' || isNaN(parseFloat(form.hourlyRate)) || parseFloat(form.hourlyRate) < 0) {
      next.hourlyRate = 'Valid hourly rate is required';
    }
    if (form.dailyRate !== '' && (isNaN(parseFloat(form.dailyRate)) || parseFloat(form.dailyRate) < 0)) {
      next.dailyRate = 'Daily rate must be a positive number or empty';
    }
    const spec = (form.specialties || []).filter(s => (s || '').trim());
    if (spec.length === 0) next.specialties = 'At least one specialty is required';
    const lang = (form.languages || []).filter(l => (l || '').trim());
    if (lang.length === 0) next.languages = 'At least one language is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const requestBody = {
        bio: form.bio.trim(),
        hourlyRate: parseFloat(form.hourlyRate),
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : null,
        responseTimeHours: parseInt(form.responseTimeHours, 10) || 24,
        isAvailable: form.isAvailable,
        specialties: (form.specialties || [])
          .filter(s => (s || '').trim())
          .map(specialty => ({ specialty: specialty.trim(), yearsExperience: 1, certificationUrl: null })),
        languages: (form.languages || [])
          .filter(l => (l || '').trim())
          .map(language => ({ language: language.trim(), proficiencyLevel: 'FLUENT' }))
      };
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GUIDES.UPDATE, { id: guideId });
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update guide');
      setMessage({ type: 'success', text: 'Guide updated successfully.' });
      setGuide(data);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update guide' });
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'ADMIN') return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading guide...</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Guide not found.</p>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 text-primary-600 hover:underline"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  const name = guide.firstName && guide.lastName
    ? `${guide.firstName} ${guide.lastName}`
    : guide.fullName || guide.user?.firstName
      ? `${guide.user?.firstName || ''} ${guide.user?.lastName || ''}`.trim()
      : `Guide #${guide.id}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </button>
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-gray-500">Admin – Edit Guide</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Guide: {name}</h1>
        <p className="text-gray-600 mb-6">ID: {guide.id}</p>

        {message.text && (
          <div className={`mb-6 p-4 rounded-md flex items-start ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={4}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Guide bio (min 50 characters)"
            />
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.hourlyRate}
                onChange={(e) => handleChange('hourlyRate', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${errors.hourlyRate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.hourlyRate && <p className="mt-1 text-sm text-red-600">{errors.hourlyRate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (USD) – optional</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.dailyRate}
                onChange={(e) => handleChange('dailyRate', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Time (hours)</label>
            <input
              type="number"
              min="1"
              max="168"
              value={form.responseTimeHours}
              onChange={(e) => handleChange('responseTimeHours', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={form.isAvailable}
              onChange={(e) => handleChange('isAvailable', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">Available for bookings</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialties *</label>
            {(form.specialties || []).map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('specialties', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Tea Tours"
                />
                <button type="button" onClick={() => removeArrayItem('specialties', index)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('specialties')} className="text-sm text-primary-600 hover:underline">+ Add specialty</button>
            {errors.specialties && <p className="mt-1 text-sm text-red-600">{errors.specialties}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages *</label>
            {(form.languages || []).map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('languages', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. English"
                />
                <button type="button" onClick={() => removeArrayItem('languages', index)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('languages')} className="text-sm text-primary-600 hover:underline">+ Add language</button>
            {errors.languages && <p className="mt-1 text-sm text-red-600">{errors.languages}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditGuide;
