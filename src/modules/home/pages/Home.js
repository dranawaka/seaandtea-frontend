import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, CalendarCheck, Star, Languages, ArrowRight, Newspaper,
  Leaf, Waves, Landmark, UtensilsCrossed, Train, Mountain, Users, Smartphone, MapPin
} from 'lucide-react';
import SearchBar from '../../../shared/components/SearchBar';
import ActivityCard from '../../../shared/components/ActivityCard';
import ImageSlider from '../../../shared/components/ImageSlider';
import { REGIONS, TOUR_CATEGORIES } from '../../../shared/data/destinations';
import { searchTours, listPublishedNewsApi, getWishlist, addWishlist, removeWishlist } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';

const Paw = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="7" cy="7.5" r="1.7" />
    <circle cx="12" cy="5.5" r="1.7" />
    <circle cx="17" cy="7.5" r="1.7" />
    <circle cx="5.2" cy="12" r="1.45" />
    <path d="M8.4 14.2c.5-1.3 1.8-2.1 3.6-2.1s3.1.8 3.6 2.1c.6 1.5.1 3.3-1.3 4.3-1 .7-1.7.8-2.3.8s-1.3-.1-2.3-.8c-1.4-1-1.9-2.8-1.3-4.3z" />
  </svg>
);

const CATEGORY_ICONS = {
  BEACH_TOURS: Waves,
  TEA_TOURS: Leaf,
  WILDLIFE_TOURS: Paw,
  CULTURAL_TOURS: Landmark,
  FOOD_TOURS: UtensilsCrossed,
  SCENIC_TOURS: Train,
  ADVENTURE_TOURS: Mountain,
  FAMILY_TOURS: Users,
};

const Home = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [popular, setPopular] = useState([]);
  const [originals, setOriginals] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let cancelled = false;
    searchTours({ sortBy: 'bookings', sortDirection: 'desc', page: 0, size: 8 })
      .then((data) => { if (!cancelled) setPopular(data.content || []); })
      .catch(() => { if (!cancelled) setPopular([]); });
    searchTours({ sortBy: 'rating', sortDirection: 'desc', page: 0, size: 8 })
      .then((data) => { if (!cancelled) setOriginals(data.content || []); })
      .catch(() => { if (!cancelled) setOriginals([]); });
    listPublishedNewsApi({ page: 0, size: 3 })
      .then((data) => { if (!cancelled) setArticles(data.content ?? []); })
      .catch(() => { if (!cancelled) setArticles([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setSaved(new Set());
      return;
    }
    getWishlist(token)
      .then((items) => setSaved(new Set((items || []).map((item) => item.id))))
      .catch(() => setSaved(new Set()));
  }, [isAuthenticated, token]);

  const toggleSave = async (tourId) => {
    if (!token) {
      sessionStorage.setItem('postLoginPath', '/');
      navigate('/login');
      return;
    }
    const next = new Set(saved);
    try {
      if (next.has(tourId)) {
        await removeWishlist(tourId, token);
        next.delete(tourId);
      } else {
        await addWishlist(tourId, token);
        next.add(tourId);
      }
      setSaved(next);
    } catch {
      // Keep the previous heart state when the save request fails.
    }
  };

  const row = (title, subtitle, tours) => (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-primary-900">{title}</h2>
            {subtitle && <p className="text-ink/70 mt-2">{subtitle}</p>}
          </div>
          <Link to="/tours" className="inline-flex items-center text-sm font-semibold text-primary-800 hover:text-accent-700 shrink-0">
            See all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        {tours.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary-200 px-6 py-8 text-ink/70">
            Tours will show up here once guides publish them.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {tours.map((tour) => (
              <div key={tour.id} className="snap-start w-72 shrink-0">
                <ActivityCard tour={tour} saved={saved.has(tour.id)} onToggleSave={toggleSave} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div>
      <div className="relative">
        <ImageSlider variant="hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.32em] text-white mb-4">
              <span className="border-b border-accent-300 pb-1">Sri Lanka</span>
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-[3.4rem] font-medium max-w-3xl mb-5 leading-[1.12] text-white">
              Discover Sri Lanka through <span className="italic text-accent-300">sea, tea,</span> and local experiences.
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-xl mb-8 leading-relaxed">
              Tea country, beaches, wildlife, temples, and train rides, arranged with local guides.
            </p>
            <SearchBar showDate variant="hero" className="max-w-3xl" />
          </div>
        </ImageSlider>

        <div className="absolute inset-x-0 bottom-0 z-30 translate-y-1/2">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <nav aria-label="Experience categories" className="rounded-2xl bg-white shadow-[0_16px_40px_rgba(16,32,60,0.14)] border border-gray-100">
              <ul className="flex overflow-x-auto md:grid md:grid-cols-8 md:overflow-visible">
                {TOUR_CATEGORIES.map((category) => {
                  const Icon = CATEGORY_ICONS[category.value] || Leaf;
                  return (
                    <li key={category.value} className="min-w-[7.25rem] flex-1 border-r border-gray-100 last:border-r-0">
                      <Link
                        to={`/tours?category=${category.value}`}
                        className="flex h-full flex-col items-center justify-center gap-2 px-2 py-4 text-center text-primary-900 hover:bg-sand transition-colors"
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.6} />
                        <span className="text-[13px] font-semibold leading-tight">{category.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <div className="h-16 sm:h-14" aria-hidden="true" />

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-primary-900 mb-6">Popular regions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {REGIONS.map((place) => (
              <Link key={place.slug} to={`/destinations/${place.slug}`} className="relative h-40 sm:h-52 rounded-2xl overflow-hidden group">
                <img src={place.image} alt={place.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 text-white font-bold">{place.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {row('Popular experiences', 'What travelers ask local guides about', popular)}
      {row('Sea and Tea Originals', 'Curated picks from highly rated local operators', originals)}

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-primary-900 mb-6">Meet a local guide</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: MapPin, title: 'Local operators', text: 'Experiences are run by Sri Lankan guides, not overseas resellers.' },
              { icon: CalendarCheck, title: 'Message to arrange', text: 'Register, then contact a guide. You agree the date and price with them.' },
              { icon: Star, title: 'Verified guides', text: 'Guides appear after a one-time onboarding fee is confirmed.' },
              { icon: Languages, title: 'English, Sinhala, Tamil', text: 'Support and many tours are offered in the languages of the island.' }
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-50 text-accent-700">
                  <item.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-primary-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-ink/70 mt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-3xl border border-gray-100 bg-white p-8 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-700">Why Sea and Tea</p>
            <h2 className="font-display text-3xl font-medium text-primary-900 mt-2">Travel with people who live here</h2>
            <ul className="mt-6 space-y-4 text-ink/80">
              <li className="flex gap-3"><Shield className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" />Listed prices are in LKR, with the USD amount beside them. You pay the guide, not the site.</li>
              <li className="flex gap-3"><MapPin className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" />Many experiences start at a hotel, station, or clear meeting point.</li>
              <li className="flex gap-3"><CalendarCheck className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" />Dates and changes are agreed in messages with the guide.</li>
            </ul>
          </div>
          <div className="lg:col-span-2 rounded-3xl bg-primary-900 text-white p-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Smartphone className="h-5 w-5" />
            </div>
            <h2 className="font-display text-3xl font-medium">Message from your phone</h2>
            <p className="text-primary-100 mt-3 leading-relaxed">Register, find a guide, and keep the conversation on your phone. Add Sea and Tea to your home screen so messages stay a tap away.</p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-100 bg-white px-8 py-7 shadow-card md:flex md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-700">The shop</p>
              <h2 className="font-display text-3xl font-medium text-primary-900 mt-2">Ceylon tea, from the same island</h2>
              <p className="text-ink/70 mt-2">Guides for the trip. Tea for home.</p>
            </div>
            <Link to="/shop" className="btn-primary mt-5 md:mt-0 inline-flex items-center shrink-0">
              Shop tea <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <section className="pt-4 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-primary-900 mb-6">From the island</h2>
          {articles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary-200 px-6 py-8 text-ink/70">
              Stories from the island will appear here.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {articles.map((post) => (
                <Link key={post.id} to={`/news/${post.id}`} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card block hover:border-accent-300">
                  <Newspaper className="h-5 w-5 text-accent-700 mb-3" />
                  <h3 className="font-semibold text-primary-900 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-ink/70 mt-2 line-clamp-3">{post.bodySummary || 'Read more'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
