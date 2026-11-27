import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ActivitiesList from './ActivitiesList';
import { categoryBySlug } from '../utils/labels';

const ActivityCategory = () => {
  const { category } = useParams();
  const match = categoryBySlug(category);
  if (!match) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Category not found</h1>
        <Link to="/things-to-do/activities" className="btn-primary mt-6 inline-flex">All activities</Link>
      </div>
    );
  }
  return <ActivitiesList lockedCategory={match.value} heading={match.label} canonical={`/things-to-do/activities/category/${match.slug}`} />;
};

export default ActivityCategory;
