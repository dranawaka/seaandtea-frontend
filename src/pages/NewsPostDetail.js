import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Newspaper, Calendar, User, MessageCircle, ThumbsUp } from 'lucide-react';
import { getNewsByIdApi } from '../config/api';

const NewsPostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const numId = id ? parseInt(id, 10) : null;
    if (!numId || isNaN(numId)) {
      setError('Invalid article');
      setLoading(false);
      return;
    }
    let cancelled = false;
    getNewsByIdApi(numId)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Article not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-gray-600 mb-6">{error || 'Article not found or not published.'}</p>
          <Link to="/" className="text-primary-600 hover:underline inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })
    : '';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-8 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Newspaper className="h-4 w-4 text-primary-600" />
              Article
            </span>
            {dateStr && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {dateStr}
              </span>
            )}
            {post.authorDisplayName && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.authorDisplayName}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {(post.likeCount ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" /> {post.likeCount} likes
              </span>
            )}
            {(post.commentCount ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" /> {post.commentCount} comments
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.body || ''}
        </div>
      </article>
    </div>
  );
};

export default NewsPostDetail;
