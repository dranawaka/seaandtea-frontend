import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { getNewsByIdApi, createNewsPostApi, updateNewsPostApi } from '../config/api';
import { useAuth } from '../context/AuthContext';

const TITLE_MAX = 500;
const BODY_MAX = 50000;

const AdminNewsEdit = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '',
    body: '',
    isPublished: true
  });

  const isNewPost = postId === 'new' || !postId;

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/admin');
      return;
    }
    if (isNewPost) {
      setLoading(false);
      setPost({ isNew: true });
      return;
    }
    const idNum = postId ? parseInt(postId, 10) : null;
    if (!idNum || isNaN(idNum)) {
      navigate('/admin');
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getNewsByIdApi(idNum, token);
        if (cancelled) return;
        if (!data) {
          setMessage({ type: 'error', text: 'Post not found.' });
          setLoading(false);
          return;
        }
        setPost(data);
        setForm({
          title: data.title || '',
          body: data.body || '',
          isPublished: data.isPublished !== false
        });
      } catch (err) {
        if (!cancelled) {
          setMessage({ type: 'error', text: err.message || 'Failed to load post.' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, postId, isNewPost, navigate, token]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next = {};
    const title = (form.title || '').trim();
    const body = (form.body || '').trim();
    if (!title) next.title = 'Title is required';
    if (title.length > TITLE_MAX) next.title = `Title must be at most ${TITLE_MAX} characters`;
    if (!body) next.body = 'Body is required';
    if (body.length > BODY_MAX) next.body = `Body must be at most ${BODY_MAX} characters`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        isPublished: form.isPublished
      };
      if (isNewPost) {
        await createNewsPostApi(payload, token);
        setMessage({ type: 'success', text: 'Post created successfully.' });
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        await updateNewsPostApi(post.id, payload, token);
        setMessage({ type: 'success', text: 'Post updated successfully.' });
        setPost(prev => ({ ...prev, ...payload }));
        setTimeout(() => navigate('/admin'), 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || (isNewPost ? 'Failed to create post' : 'Failed to update post') });
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'ADMIN') return null;
  if (loading || (!post && !isNewPost)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {loading && <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4" />}
          {!loading && message.text && <p className="text-red-600 mb-4">{message.text}</p>}
          {!loading && <button onClick={() => navigate('/admin')} className="text-primary-600 hover:underline">Back to Admin</button>}
        </div>
      </div>
    );
  }

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
            <span className="text-sm font-medium text-gray-500">Admin – {isNewPost ? 'Create Post' : 'Edit Post'}</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{isNewPost ? 'Create news post' : `Edit: ${post.title}`}</h1>
        {!isNewPost && <p className="text-gray-600 mb-6">ID: {post.id}</p>}
        {isNewPost && <p className="text-gray-600 mb-6">Published posts appear in the public news feed. Save as draft to hide until ready.</p>}

        {message.text && (
          <div className={`mb-6 p-4 rounded-md flex items-start ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title * (max {TITLE_MAX} characters)</label>
            <input
              type="text"
              maxLength={TITLE_MAX}
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Post title"
            />
            <p className="mt-1 text-xs text-gray-500">{form.title.length} / {TITLE_MAX}</p>
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body * (max {BODY_MAX} characters)</label>
            <textarea
              value={form.body}
              maxLength={BODY_MAX}
              onChange={(e) => handleChange('body', e.target.value)}
              rows={12}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${errors.body ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Full post content (markdown or plain text)..."
            />
            <p className="mt-1 text-xs text-gray-500">{form.body.length} / {BODY_MAX}</p>
            {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}
          </div>

          <div className="flex items-center">
            <input
              id="isPublished"
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
              Published (visible in public feed)
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : (isNewPost ? 'Create post' : 'Update post')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNewsEdit;
