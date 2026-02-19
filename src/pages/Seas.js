import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Clock, Waves, Sunset, Camera, Fish, ArrowRight, Shield } from 'lucide-react';
import { getGuidesBySpecialty } from '../data/mockData';
import { FEATURE_TOURS_ENABLED } from '../config/features';

const Seas = () => {
  const [beachGuides, setBeachGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBeachGuides();
  }, []);

  const loadBeachGuides = async () => {
    try {
      const guides = await getGuidesBySpecialty('Beach Tours');
      setBeachGuides(guides);
    } catch (error) {
      console.error('Error loading beach guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const beachExperiences = [
    {
      id: 1,
      title: 'Mirissa Whale Watching & Beach',
      location: 'Mirissa, Sri Lanka',
      duration: '8 hours',
      price: 95,
      rating: 4.9,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      highlights: ['Blue whale watching', 'Dolphin encounters', 'Beach relaxation', 'Fresh seafood lunch'],
      description: 'Experience the thrill of whale watching in Mirissa, followed by pristine beach time and local seafood.'
    },
    {
      id: 2,
      title: 'Arugam Bay Surf & Beach Life',
      location: 'Arugam Bay, Sri Lanka',
      duration: '6 hours',
      price: 75,
      rating: 4.8,
      reviews: 198,
      image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      highlights: ['Surfing lessons', 'Beach culture', 'Local fishing village', 'Sunset viewing'],
      description: 'Discover Sri Lanka\'s surf capital with lessons for all levels and authentic beach village culture.'
    },
    {
      id: 3,
      title: 'Unawatuna Bay Snorkeling Adventure',
      location: 'Unawatuna, Sri Lanka',
      duration: '4 hours',
      price: 55,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      highlights: ['Coral reef snorkeling', 'Sea turtle spotting', 'Beach games', 'Coconut water fresh'],
      description: 'Explore colorful coral reefs and swim with sea turtles in this protected bay near Galle.'
    },
    {
      id: 4,
      title: 'Bentota Water Sports Extravaganza',
      location: 'Bentota, Sri Lanka',
      duration: '5 hours',
      price: 85,
      rating: 4.6,
      reviews: 143,
      image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      highlights: ['Jet skiing', 'Banana boat rides', 'Windsurfing', 'River safari'],
      description: 'Action-packed water sports adventure on one of Sri Lanka\'s most popular beach destinations.'
    },
    {
      id: 5,
      title: 'Tangalle Pristine Beach Escape',
      location: 'Tangalle, Sri Lanka',
      duration: '7 hours',
      price: 65,
      rating: 4.8,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      highlights: ['Untouched beaches', 'Rock pools exploration', 'Local crab curry', 'Lighthouse visit'],
      description: 'Escape to untouched paradise beaches with crystal clear waters and authentic local experiences.'
    },
    {
      id: 6,
      title: 'Hikkaduwa Coral Garden Tour',
      location: 'Hikkaduwa, Sri Lanka',
      duration: '3 hours',
      price: 45,
      rating: 4.5,
      reviews: 267,
      image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      highlights: ['Glass bottom boat', 'Coral sanctuary', 'Tropical fish viewing', 'Beach photography'],
      description: 'Discover vibrant coral gardens and tropical marine life in Sri Lanka\'s first marine sanctuary.'
    }
  ];

  const beachFeatures = [
    {
      icon: <Waves className="h-8 w-8 text-blue-600" />,
      title: 'Year-Round Paradise',
      description: 'Sri Lanka\'s strategic location offers perfect beach weather throughout the year on different coasts.'
    },
    {
      icon: <Fish className="h-8 w-8 text-teal-600" />,
      title: 'Marine Biodiversity',
      description: 'Home to blue whales, dolphins, sea turtles, and vibrant coral reefs in protected marine parks.'
    },
    {
      icon: <Sunset className="h-8 w-8 text-orange-600" />,
      title: 'Pristine & Uncrowded',
      description: 'Experience untouched beaches with golden sand, crystal waters, and authentic local fishing communities.'
    }
  ];

  const coastalRegions = [
    {
      name: 'West Coast',
      season: 'Nov - Apr',
      beaches: ['Negombo', 'Bentota', 'Hikkaduwa', 'Mirissa'],
      specialty: 'Water sports & vibrant beach life'
    },
    {
      name: 'South Coast',
      season: 'Nov - Apr',
      beaches: ['Unawatuna', 'Galle', 'Tangalle', 'Matara'],
      specialty: 'Historic charm & pristine bays'
    },
    {
      name: 'East Coast',
      season: 'May - Sep',
      beaches: ['Arugam Bay', 'Pasikudah', 'Batticaloa'],
      specialty: 'World-class surfing & untouched beauty'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-primary-800 text-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sri Lankan
              <span className="text-primary-200"> Seas Paradise</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-200">
              Discover pristine beaches, world-class surfing, whale watching, and vibrant coral reefs 
              along Sri Lanka's stunning 1,600km coastline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/guides" className="btn-secondary text-lg px-8 py-3">
                Find Sea Guides
              </Link>
              {FEATURE_TOURS_ENABLED && (
                <Link to="/tours" className="btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary-800">
                  Browse All Tours
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Beach Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                             Why Sri Lankan Seas?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of natural beauty, marine life, and authentic coastal culture
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {beachFeatures.map((feature, index) => (
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

      {/* Coastal Regions Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                             Best Sea Seasons
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plan your perfect beach getaway with our seasonal guide to Sri Lanka's coastal regions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {coastalRegions.map((region, index) => (
              <div key={index} className="card text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {region.name}
                </h3>
                <div className="text-primary-600 font-medium mb-4">
                  Best Season: {region.season}
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Popular Beaches:</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {region.beaches.map((beach, i) => (
                      <span key={i} className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">
                        {beach}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {region.specialty}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beach Experiences Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                             Popular Sea Experiences
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From whale watching to surfing, discover the best of Sri Lanka's coastal adventures
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beachExperiences.map((experience) => (
              <div key={experience.id} className="card overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={experience.image} 
                    alt={experience.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-primary-600">
                    {experience.rating} ★
                  </div>
                  <div className="absolute bottom-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${experience.price}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {experience.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {experience.location}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {experience.duration}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">
                        {experience.rating} ({experience.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Highlights:</div>
                    <div className="flex flex-wrap gap-2">
                      {experience.highlights.map((highlight, index) => (
                        <span key={index} className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6">
                    {experience.description}
                  </p>
                  
                  <button className="btn-primary w-full">
                    Book Beach Experience
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beach Guides Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                             Expert Sea Guides
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover hidden coves and pristine beaches with local guides who know every tide and current
            </p>
          </div>
          
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading beach guides...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {beachGuides.map((guide) => (
                <div key={guide.id} className="card overflow-hidden">
                  <div className="relative">
                    <img 
                      src={guide.image} 
                      alt={guide.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-primary-600">
                      {guide.rating} ★
                    </div>
                    {guide.verified && (
                      <div className="absolute top-4 left-4 bg-primary-600 text-white p-2 rounded-full">
                        <Shield className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {guide.name}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {guide.location}
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">
                          {guide.rating} ({guide.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {guide.tours} tours
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-6">
                      {guide.bio}
                    </p>
                    
                    <div className="flex gap-2">
                      <Link 
                        to={`/guide/${guide.id}`}
                        className="btn-outline flex-1 text-center"
                      >
                        View Profile
                      </Link>
                      <button className="btn-primary flex-1">
                        Book Guide
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {beachGuides.length === 0 && !loading && (
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-4">No beach guides available at the moment.</p>
              <Link to="/guides" className="btn-primary">
                Browse All Guides
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Your Sea Adventure?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-200">
            Book your perfect Sri Lankan beach experience today and discover why our coastline 
            is considered among the world's most beautiful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/guides" className="btn-secondary text-lg px-8 py-3 flex items-center justify-center">
              Find Sea Guides
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/contact" className="btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary-800">
              Custom Sea Tour
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Seas;
