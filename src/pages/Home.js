import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, ArrowRight, Globe, Shield, Heart, Clock, Mountain, Waves, TreePine, Building, Newspaper, MessageCircle, ThumbsUp } from 'lucide-react';
import { mockDestinations } from '../data/mockData';
import ImageSlider from '../components/ImageSlider';
import { listPublishedNewsApi } from '../config/api';
import { FEATURE_TOURS_ENABLED } from '../config/features';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listPublishedNewsApi({ page: 0, size: 6 })
      .then((data) => {
        if (!cancelled) setArticles(data.content ?? []);
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      })
      .finally(() => {
        if (!cancelled) setArticlesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);
  const features = [
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: 'Compact Diversity',
      description: 'Experience beaches, mountains, culture & wildlife within 2-3 hours - Sri Lanka\'s unique advantage.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Verified Local Guides',
      description: 'Connect with Sri Lanka\'s thriving freelance guide community - unified and verified for your safety.'
    },
    {
      icon: <Globe className="h-8 w-8 text-primary-600" />,
      title: 'The Upwork Model',
      description: 'Browse profiles, compare prices, and book directly with independent guides - just like Upwork.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Image Slider */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ImageSlider />
        </div>
        
        {/* Additional Hero Content */}
        <div className="relative bg-primary-800 text-white py-20 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              The Upwork for
              <span className="block text-primary-100 mt-1"> Travel Guides</span>
              <span className="text-2xl md:text-4xl lg:text-5xl font-semibold block mt-2 text-primary-200">in Sri Lanka</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto text-primary-200 leading-relaxed animate-fade-in">
              To connect travelers with verified local guides for authentic, flexible, and personalized Sri Lankan experiences.
            </p>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 gradient-text">
              Why Choose Sea & Tea?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              We unify Sri Lanka's fragmented freelance guide community, creating the ultimate platform 
              for travelers to connect with local experts.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <div key={index} className="card-modern p-8 text-center group">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary-50 rounded-xl group-hover:scale-105 transition-transform duration-200">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sri Lanka Advantage Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 gradient-text">
              The Sri Lanka Edge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              What makes Sri Lanka the perfect destination for guided travel experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="card-modern p-6 text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-100 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <Waves className="h-10 w-10 text-primary-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pristine Beaches</h3>
              <p className="text-gray-600 text-sm leading-relaxed">From Mirissa to Arugam Bay, discover untouched coastal paradises</p>
            </div>
            
            <div className="card-modern p-6 text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-100 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <Mountain className="h-10 w-10 text-primary-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Misty Mountains</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Ella, Nuwara Eliya & tea plantations in the central highlands</p>
            </div>
            
            <div className="card-modern p-6 text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-100 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <Building className="h-10 w-10 text-primary-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ancient Culture</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Temples, ruins & UNESCO sites spanning 2000+ years of history</p>
            </div>
            
            <div className="card-modern p-6 text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-100 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <TreePine className="h-10 w-10 text-primary-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Wildlife Safaris</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Elephants, leopards & exotic birds in national parks</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <div className="card-modern p-10 max-w-4xl mx-auto bg-primary-50/50">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-4 gradient-text">
                All Within 2-3 Hours Travel
              </h3>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Sri Lanka's compact size means you can experience diverse landscapes and cultures in a single trip. 
                Start your morning on a mountain trail and end your day watching the sunset on a pristine beach.
              </p>
              {FEATURE_TOURS_ENABLED && (
                <Link to="/tours" className="btn-primary text-lg px-10 py-4 inline-flex items-center">
                  Explore Sri Lanka Tours
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 gradient-text">
              Sri Lanka's Compact Diversity
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience the magic of Sri Lanka - from pristine beaches to misty mountains, 
              ancient temples to wildlife safaris - all within easy reach.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {mockDestinations.map((destination) => (
              <div key={destination.id} className="card-modern overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 glass rounded-full px-4 py-2 text-sm font-bold text-gray-900 shadow-lg">
                    {destination.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {destination.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                    <span className="text-sm font-medium">{destination.location}</span>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-secondary-500 mr-1 fill-current" />
                      <span className="text-sm text-gray-600 font-medium">
                        {destination.rating} ({destination.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1 text-primary-600" />
                      <span className="font-medium">{destination.duration}</span>
                    </div>
                  </div>
                  {FEATURE_TOURS_ENABLED ? (
                    <Link 
                      to={`/tour/${destination.id}`}
                      className="btn-primary w-full flex items-center justify-center"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  ) : (
                    <span className="btn-primary w-full flex items-center justify-center opacity-90 cursor-default">
                      Coming soon
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {FEATURE_TOURS_ENABLED && (
            <div className="text-center mt-16">
              <Link to="/tours" className="btn-outline text-lg px-10 py-4 inline-flex items-center">
                View All Tours
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Latest News & Articles */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 gradient-text">
              Latest News & Articles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Updates, travel tips, and stories from Sea & Tea and our community.
            </p>
          </div>

          {articlesLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No articles yet. Check back soon for news and travel stories.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {articles.map((post) => (
                <article key={post.id} className="card-modern overflow-hidden group flex flex-col">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center text-primary-600 mb-3">
                      <Newspaper className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'News'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1 line-clamp-3 mb-4">
                      {post.bodySummary || 'Read more...'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                      <span>{post.authorDisplayName || 'Sea & Tea'}</span>
                      <div className="flex items-center gap-3">
                        {(post.likeCount ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5" /> {post.likeCount}
                          </span>
                        )}
                        {(post.commentCount ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" /> {post.commentCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/news/${post.id}`}
                    className="block px-6 py-4 bg-gray-50 group-hover:bg-primary-50 text-primary-600 font-medium text-sm transition-colors flex items-center"
                  >
                    Read article
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative section-padding bg-primary-800 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-400/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            Ready to Explore Sri Lanka?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-gray-100 leading-relaxed">
            Join the growing community of travelers discovering Sri Lanka through our verified local guides.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register" className="btn-secondary text-lg px-10 py-4 inline-flex items-center justify-center">
              Get Started Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <Link to="/contact" className="border-2 border-white/80 text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-10 rounded-xl transition-all duration-300 text-lg inline-flex items-center justify-center backdrop-blur-sm hover:shadow-xl transform hover:-translate-y-0.5">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

