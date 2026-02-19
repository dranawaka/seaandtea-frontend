import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Clock, Leaf, Mountain, Camera, Coffee, ArrowRight } from 'lucide-react';
import { getGuidesBySpecialty } from '../data/mockData';
import { FEATURE_TOURS_ENABLED } from '../config/features';

const Tea = () => {
  const [teaGuides, setTeaGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeaGuides();
  }, []);

  const loadTeaGuides = async () => {
    try {
      const guides = await getGuidesBySpecialty('Tea Tours');
      setTeaGuides(guides);
    } catch (error) {
      console.error('Error loading tea guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const teaExperiences = [
    {
      id: 1,
      title: 'Ella Tea Plantation Trek',
      location: 'Ella, Sri Lanka',
      duration: '6 hours',
      price: 85,
      rating: 4.9,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1597318985999-dd64bcc84baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      highlights: ['Tea picking experience', 'Factory tour', 'Tea tasting session', 'Nine Arch Bridge visit'],
      description: 'Experience the art of tea making in the misty hills of Ella with guided plantation walks and authentic tastings.'
    },
    {
      id: 2,
      title: 'Nuwara Eliya Tea Heritage',
      location: 'Nuwara Eliya, Sri Lanka',
      duration: '8 hours',
      price: 120,
      rating: 4.8,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba890fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      highlights: ['Historic tea estates', 'British colonial history', 'Premium tea varieties', 'Little England experience'],
      description: 'Discover the colonial tea heritage of Little England with visits to historic estates and premium tea gardens.'
    },
    {
      id: 3,
      title: 'Kandy Tea & Spice Trail',
      location: 'Kandy, Sri Lanka',
      duration: '4 hours',
      price: 65,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      highlights: ['Spice garden tour', 'Tea plantation visit', 'Traditional tea ceremony', 'Local village experience'],
      description: 'Combine tea culture with spice heritage in the hills around Kandy, including traditional ceremonies.'
    }
  ];

  const teaFacts = [
    {
      icon: <Leaf className="h-8 w-8 text-green-600" />,
      title: 'Ceylon Tea Heritage',
      description: 'Sri Lanka is the 4th largest tea producer globally, famous for high-quality Ceylon tea since 1867.'
    },
    {
      icon: <Mountain className="h-8 w-8 text-blue-600" />,
      title: 'High Altitude Excellence',
      description: 'Tea grown above 1,200m elevation produces the finest flavors, found in Nuwara Eliya and Ella regions.'
    },
    {
      icon: <Coffee className="h-8 w-8 text-amber-600" />,
      title: 'Seven Tea Regions',
      description: 'Each region produces distinct flavors: Nuwara Eliya, Dimbula, Uva, Kandy, Ruhuna, Sabaragamuwa, Uda Pussellawa.'
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
              <span className="text-primary-200"> Tea Adventures</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-200">
              Experience the world's finest Ceylon tea with guided plantation tours, 
              tastings, and authentic tea-making experiences in the misty highlands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/guides" className="btn-secondary text-lg px-8 py-3">
                Find Tea Guides
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

      {/* Tea Facts Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ceylon Tea Legacy
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover why Sri Lankan tea is renowned worldwide for its exceptional quality and unique flavors
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teaFacts.map((fact, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {fact.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {fact.title}
                </h3>
                <p className="text-gray-600">
                  {fact.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tea Experiences Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Tea Experiences
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From plantation walks to tea tastings, discover authentic Ceylon tea culture
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teaExperiences.map((experience) => (
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
                    Book Tea Experience
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tea Guides Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Expert Tea Guides
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn from local experts who know every tea garden and plantation story
            </p>
          </div>
          
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tea guides...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teaGuides.map((guide) => (
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
          
          {teaGuides.length === 0 && !loading && (
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-4">No tea guides available at the moment.</p>
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
            Ready to Taste Ceylon's Finest?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-200">
            Book your authentic Sri Lankan tea experience today and discover why Ceylon tea 
            is treasured worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/guides" className="btn-secondary text-lg px-8 py-3 flex items-center justify-center">
              Find Tea Guides
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/contact" className="btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary-800">
              Custom Tea Tour
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tea;
