import React, { useEffect } from 'react';
import { Users, Globe, Heart, Shield, Award, Target } from 'lucide-react';

const ABOUT_SEO = {
  title: 'About Us | Sea & Tea - Sri Lanka Local Travel Guides',
  description: 'Sea & Tea connects travelers with verified local guides for authentic, flexible, and personalized Sri Lankan experiences. The leading marketplace for independent travel guides.',
  canonical: '/about',
};

const About = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = ABOUT_SEO.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : null;
    if (metaDesc) metaDesc.setAttribute('content', ABOUT_SEO.description);

    const setMeta = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    const origin = window.location.origin;
    setMeta('og:title', ABOUT_SEO.title);
    setMeta('og:description', ABOUT_SEO.description);
    setMeta('og:url', `${origin}${ABOUT_SEO.canonical}`);
    setMeta('og:type', 'website');

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    const prevCanonical = canonicalEl.getAttribute('href');
    canonicalEl.setAttribute('href', `${origin}${ABOUT_SEO.canonical}`);

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc);
      if (canonicalEl) {
        if (prevCanonical != null) canonicalEl.setAttribute('href', prevCanonical);
        else canonicalEl.remove();
      }
    };
  }, []);

  const stats = [
    { number: '200+', label: 'Happy Travelers', icon: <Users className="h-8 w-8 text-primary-600" /> },
    { number: '75+', label: 'Sri Lankan Guides', icon: <Globe className="h-8 w-8 text-primary-600" /> },
    { number: '15+', label: 'Sri Lanka Regions', icon: <Heart className="h-8 w-8 text-primary-600" /> },
    { number: '96%', label: 'Satisfaction Rate', icon: <Award className="h-8 w-8 text-primary-600" /> }
  ];

  const values = [
    {
      icon: <Heart className="h-12 w-12 text-primary-600" />,
      title: 'Sri Lanka Focus',
      description: 'We specialize in Sri Lanka\'s unique compact diversity - beaches, mountains, culture & wildlife within 2-3 hours travel.'
    },
    {
      icon: <Shield className="h-12 w-12 text-primary-600" />,
      title: 'Verified Guides',
      description: 'All our guides are verified, certified locals from Sri Lanka\'s thriving freelance guide community.'
    },
    {
      icon: <Target className="h-12 w-12 text-primary-600" />,
      title: 'Upwork Model',
      description: 'Browse profiles, compare prices, and book directly with independent guides - just like Upwork for travel.'
    }
  ];

  const team = [
    {
      name: 'Dilan Ranawaka',
      role: 'CEO',
      image: '/images/dilan-ranawaka-ceo.png',
      bio: 'Technology leader and entrepreneur with expertise in building scalable platforms and digital solutions for the travel industry.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About Sea & Tea
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-primary-100">
            To connect travelers with verified local guides for authentic, flexible, and personalized Sri Lankan experiences.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                To empower independent travel guides in Sri Lanka by giving them a trusted digital platform to showcase their expertise, 
                connect directly with travelers, and build sustainable, independent careers — while enabling travelers to discover 
                authentic, verified local experiences with confidence.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1000&q=80"
                alt="Travelers with a local guide on an authentic Sri Lankan experience"
                className="rounded-lg shadow-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <img 
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80"
                alt="Global travel and discovery"
                className="rounded-lg shadow-xl object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Vision
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                To become the leading global marketplace for independent travel guides — starting in Sri Lanka and expanding to 
                compact, culturally rich destinations worldwide — transforming how travelers discover and book local expertise.
              </p>
              <p className="text-lg text-gray-600">
                We envision a world where independent local guides are no longer hidden in fragmented social networks but are 
                discoverable, trusted, and empowered through technology. Sea & Tea will redefine travel by building a global 
                ecosystem where local expertise meets global curiosity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-gray-600">
              See how we're making a difference in the travel industry
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and every experience we create
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate people behind Sea & Tea who make it all possible
            </p>
          </div>
          
          <div className="grid md:grid-cols-1 gap-8 max-w-md mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-xl mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience Authentic Travel?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of travelers and local experts, and discover the world in a whole new way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/tours" className="btn-secondary text-lg px-8 py-3">
              Explore Tours
            </a>
            <a href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

