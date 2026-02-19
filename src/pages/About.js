import React, { useEffect } from 'react';
import { Users, Globe, Heart, Shield, Award, Target } from 'lucide-react';

const ABOUT_SEO = {
  title: 'About Us | Sea & Tea - Sri Lanka Local Travel Guides',
  description: 'Sea & Tea is the Upwork for travel guides in Sri Lanka. We unite verified local guides with travelers for authentic experiences—beaches, mountains, culture & wildlife.',
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
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            We're building "The Upwork for Travel Guides in Sri Lanka" - unifying the country's fragmented 
            freelance guide community into one trusted platform for authentic travel experiences.
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
                At Sea & Tea, we're solving a real problem in Sri Lanka's tourism industry. The country has a thriving community 
                of freelance travel guides, but they're scattered across Facebook groups, WhatsApp chats, and word-of-mouth networks.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We're building the platform that unifies this fragmented community, making it easy for travelers to find, compare, and book 
                directly with verified local guides. Think of us as "The Upwork for Travel Guides in Sri Lanka" - where independent 
                guides can showcase their expertise and travelers can discover authentic experiences.
              </p>
              <p className="text-lg text-gray-600">
                Our vision extends beyond Sri Lanka. After establishing ourselves here, we plan to expand to other compact, diverse 
                destinations like Bali, Maldives, and Nepal - places where travelers can experience multiple landscapes and cultures in short trips.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Team collaboration"
                className="rounded-lg shadow-xl"
              />
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

