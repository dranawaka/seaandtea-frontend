import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, CalendarCheck, Star, Languages, ArrowRight, Newspaper,
  Leaf, Waves, Bird, Landmark, UtensilsCrossed, Train, Mountain, Users, Smartphone, MapPin
} from 'lucide-react';
import SearchBar from '../../../shared/components/SearchBar';
import ActivityCard from '../../../shared/components/ActivityCard';
import ImageSlider from '../../../shared/components/ImageSlider';
import { REGIONS, TOUR_CATEGORIES } from '../../../shared/data/destinations';
import { searchTours, listPublishedNewsApi, getWishlist, addWishlist, removeWishlist } from '../../../shared/config/api';
import { useAuth } from '../../../shared/context/AuthContext';

const CATEGORY_ICONS = {
  TEA_TOURS: Leaf,
  BEACH_TOURS: Waves,
  WILDLIFE_TOURS: Bird,
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
        <div className="flex items-end justify-between mb-5 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink">{title}</h2>
            {subtitle && <p className="text-ink/70 mt-1">{subtitle}</p>}
          </div>
          <Link to="/tours" className="text-sm font-bold text-primary-700 hover:text-primary-900 shrink-0">See all</Link>
        </div>
        {tours.length === 0 ? (
          <p className="text-ink/60">Tours will show up here once guides publish them.</p>
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
      <ImageSlider variant="hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-16 md:py-24 w-full">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary-100 mb-3">Sri Lanka</p>
          <h1 className="text-4xl md:text-6xl font-extrabold max-w-3xl mb-4 leading-tight">Discover Sri Lanka through sea, tea, and local experiences.</h1>
          <p className="text-lg text-primary-100 max-w-2xl mb-8">Tea country, beaches, wildlife, temples, and train rides, arranged with local guides.</p>
          <SearchBar showDate variant="hero" className="max-w-3xl" />
        </div>
      </ImageSlider>

      <section className="bg-white border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-2 overflow-x-auto">
          {TOUR_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.value] || Leaf;
            return (
              <Link
                key={category.value}
                to={`/tours?category=${category.value}`}
                className="shrink-0 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-sand px-4 py-2 text-sm font-bold text-ink hover:border-primary-600 hover:text-primary-800"
              >
                <Icon className="h-4 w-4 text-primary-600" />
                {category.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink mb-5">Popular regions</h2>
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
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink mb-5">Meet a local guide</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: MapPin, title: 'Local operators', text: 'Experiences are run by Sri Lankan guides, not overseas resellers.' },
              { icon: CalendarCheck, title: 'Message to arrange', text: 'Register, then contact a guide. You agree the date and price with them.' },
              { icon: Star, title: 'Verified guides', text: 'Guides appear after a one-time onboarding fee is confirmed.' },
              { icon: Languages, title: 'English, Sinhala, Tamil', text: 'Support and many tours are offered in the languages of the island.' }
            ].map((item) => (
              <div key={item.title} className="card-modern p-5">
                <item.icon className="h-6 w-6 text-primary-600 mb-3" />
                <h3 className="font-bold text-ink">{item.title}</h3>
                <p className="text-sm text-ink/70 mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-4">
          <div className="card-modern p-8">
            <h2 className="text-2xl font-extrabold text-ink">Why use Sea and Tea</h2>
            <ul className="mt-4 space-y-3 text-ink/80">
              <li className="flex gap-3"><Shield className="h-5 w-5 text-secondary-500 shrink-0 mt-0.5" />Listed prices are in LKR, with the USD amount beside them. You pay the guide, not the site.</li>
              <li className="flex gap-3"><MapPin className="h-5 w-5 text-secondary-500 shrink-0 mt-0.5" />Many experiences start at a hotel, station, or clear meeting point.</li>
              <li className="flex gap-3"><CalendarCheck className="h-5 w-5 text-secondary-500 shrink-0 mt-0.5" />Dates and changes are agreed in messages with the guide.</li>
            </ul>
          </div>
          <div className="brand-hero text-white rounded-2xl p-8">
            <Smartphone className="h-7 w-7 mb-3" />
            <h2 className="text-2xl font-extrabold">Message from your phone</h2>
            <p className="text-primary-100 mt-2">Register, find a guide, and keep the conversation on your phone. Add Sea and Tea to your home screen so messages stay a tap away.</p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-modern p-8 md:flex md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary-700">The shop</p>
              <h2 className="text-2xl font-extrabold text-ink mt-1">Ceylon tea, from the same island</h2>
              <p className="text-ink/70 mt-2">Guides for the trip. Tea for home.</p>
            </div>
            <Link to="/shop" className="btn-primary mt-4 md:mt-0 inline-flex items-center">
              Shop tea <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-ink mb-5">From the island</h2>
          {articles.length === 0 ? (
            <p className="text-ink/60">No articles yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {articles.map((post) => (
                <Link key={post.id} to={`/news/${post.id}`} className="card-modern p-5 block hover:border-primary-300">
                  <Newspaper className="h-5 w-5 text-primary-700 mb-3" />
                  <h3 className="font-bold text-ink line-clamp-2">{post.title}</h3>
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
