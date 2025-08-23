import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, ArrowRight, Globe, Shield, Heart, Clock, Mountain, Waves, TreePine, Building } from 'lucide-react';
import { mockDestinations } from '../data/mockData';

const Home = () => {
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Upwork for
              <span className="text-secondary-400"> Travel Guides</span>
              <br />
              <span className="text-2xl md:text-4xl">in Sri Lanka</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Connect with Sri Lanka's best freelance travel guides. Experience beaches, mountains, 
              culture & wildlife within 2-3 hours - all with certified local experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tours" className="btn-secondary text-lg px-8 py-3">
                Explore Tours
              </Link>
              <Link to="/guides" className="btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary-600">
                Find Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Sea & Tea Tours?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We unify Sri Lanka's fragmented freelance guide community, creating the ultimate platform 
              for travelers to connect with local experts.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sri Lanka Advantage Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Sri Lanka Edge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              What makes Sri Lanka the perfect destination for guided travel experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Waves className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pristine Beaches</h3>
              <p className="text-gray-600 text-sm">From Mirissa to Arugam Bay, discover untouched coastal paradises</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Mountain className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Misty Mountains</h3>
              <p className="text-gray-600 text-sm">Ella, Nuwara Eliya & tea plantations in the central highlands</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Building className="h-12 w-12 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ancient Culture</h3>
              <p className="text-gray-600 text-sm">Temples, ruins & UNESCO sites spanning 2000+ years of history</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <TreePine className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Wildlife Safaris</h3>
              <p className="text-gray-600 text-sm">Elephants, leopards & exotic birds in national parks</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                All Within 2-3 Hours Travel
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Sri Lanka's compact size means you can experience diverse landscapes and cultures in a single trip. 
                Start your morning on a mountain trail and end your day watching the sunset on a pristine beach.
              </p>
              <Link to="/tours" className="btn-primary text-lg px-8 py-3">
                Explore Sri Lanka Tours
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sri Lanka's Compact Diversity
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the magic of Sri Lanka - from pristine beaches to misty mountains, 
              ancient temples to wildlife safaris - all within easy reach.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {mockDestinations.map((destination) => (
              <div key={destination.id} className="card overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-900">
                    {destination.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {destination.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {destination.location}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-secondary-500 mr-1" />
                      <span className="text-sm text-gray-600">
                        {destination.rating} ({destination.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {destination.duration}
                    </div>
                  </div>
                  <Link 
                    to={`/tour/${destination.id}`}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/tours" className="btn-outline text-lg px-8 py-3">
              View All Tours
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Explore Sri Lanka?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join the growing community of travelers discovering Sri Lanka through our verified local guides.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-secondary text-lg px-8 py-3">
              Get Started Today
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

