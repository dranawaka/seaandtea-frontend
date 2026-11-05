// Mock data for the tour agency website
// This can be easily replaced with real API calls

export const mockGuides = [
  {
    id: 1,
    name: 'Priya Fernando',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Colombo, Sri Lanka',
    languages: ['English', 'Sinhala', 'Tamil', 'Mandarin'],
    rating: 4.9,
    reviews: 156,
    tours: 23,
    specialties: ['Cultural Tours', 'Food Tours', 'City Tours'],
    bio: 'Certified local guide with 8+ years of experience in Colombo. Expert in Sri Lankan culture, cuisine, and hidden gems.',
    experience: '8+ years',
    certifications: ['Certified Tour Guide', 'Food Safety Certificate', 'First Aid Certified', 'Mandarin Language Certificate'],
    hourlyRate: 25,
    dailyRate: 150,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    contact: {
      email: 'priya@seaandtea.com',
      phone: '+94 71 234 5678',
      whatsapp: '+94 71 234 5678'
    },
    verified: true,
    responseTime: '2 hours'
  },
  {
    id: 2,
    name: 'Kumar Perera',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Kandy, Sri Lanka',
    languages: ['English', 'Sinhala', 'Tamil', 'Russian'],
    rating: 4.8,
    reviews: 89,
    tours: 15,
    specialties: ['Wildlife Tours', 'Temple Tours', 'Tea Plantation Tours'],
    bio: 'Wildlife expert and cultural guide specializing in Kandy\'s ancient temples and surrounding national parks.',
    experience: '5+ years',
    certifications: ['Wildlife Guide License', 'Archaeological Guide License', 'Tourism Management Degree', 'Russian Language Certificate'],
    hourlyRate: 30,
    dailyRate: 180,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    contact: {
      email: 'kumar@seaandtea.com',
      phone: '+94 81 234 5678',
      whatsapp: '+94 81 234 5678'
    },
    verified: true,
    responseTime: '1 hour'
  },
  {
    id: 3,
    name: 'Sunil Silva',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Galle, Sri Lanka',
    languages: ['English', 'Sinhala', 'Tamil'],
    rating: 4.7,
    reviews: 203,
    tours: 31,
    specialties: ['Beach Tours', 'Historical Tours', 'Water Sports'],
    bio: 'Coastal expert and certified diving instructor with deep knowledge of Galle Fort and southern beaches.',
    experience: '12+ years',
    certifications: ['PADI Diving Instructor', 'Historical Guide License', 'Water Sports Safety Certificate'],
    hourlyRate: 28,
    dailyRate: 160,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    contact: {
      email: 'sunil@seaandtea.com',
      phone: '+94 91 234 5678',
      whatsapp: '+94 91 234 5678'
    },
    verified: true,
    responseTime: '3 hours'
  },
  {
    id: 4,
    name: 'Anjali Weerasinghe',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Ella, Sri Lanka',
    languages: ['English', 'Sinhala', 'Tamil', 'Mandarin'],
    rating: 4.9,
    reviews: 178,
    tours: 28,
    specialties: ['Mountain Trekking', 'Tea Tours', 'Adventure Tours'],
    bio: 'Mountain guide and tea plantation expert specializing in Ella\'s scenic trails and tea culture.',
    experience: '6+ years',
    certifications: ['Mountain Guide License', 'Tea Tourism Certificate', 'Adventure Tourism Guide', 'Mandarin Language Certificate'],
    hourlyRate: 32,
    dailyRate: 190,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    contact: {
      email: 'anjali@seaandtea.com',
      phone: '+94 57 234 5678',
      whatsapp: '+94 57 234 5678'
    },
    verified: true,
    responseTime: '1 hour'
  }
];

export const mockTours = [
  {
    id: 1,
    title: 'Colombo Cultural & Food Experience',
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Colombo, Sri Lanka',
    category: 'Cultural',
    price: 45,
    duration: '1 day',
    groupSize: '2-6 people',
    rating: 4.8,
    reviews: 1247,
    guideId: 1,
    guide: 'Priya Fernando',
    highlights: ['Temple Visits', 'Local Markets', 'Street Food', 'Colonial Architecture'],
    description: 'Experience the vibrant culture and delicious cuisine of Colombo with visits to ancient temples, bustling markets, and authentic local food spots.',
    itinerary: [
      {
        day: 1,
        title: 'Morning Cultural Tour',
        activities: ['Visit Gangaramaya Temple', 'Explore Pettah Market', 'Colonial architecture walk']
      },
      {
        day: 1,
        title: 'Afternoon Food Adventure',
        activities: ['Street food tasting', 'Traditional tea experience', 'Local restaurant visit']
      }
    ],
    included: ['Guide services', 'Transportation', 'Food tastings', 'Temple entrance fees'],
    notIncluded: ['Lunch', 'Personal expenses', 'Optional activities', 'Gratuities'],
    availability: ['2024-03-15', '2024-04-20', '2024-05-18', '2024-06-22'],
    instantBooking: true,
    securePayment: true,
    languages: ['English', 'Sinhala', 'Tamil', 'Mandarin']
  },
  {
    id: 2,
    title: 'Kandy Temple & Wildlife Safari',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Kandy, Sri Lanka',
    category: 'Cultural & Wildlife',
    price: 85,
    duration: '1 day',
    groupSize: '2-4 people',
    rating: 4.9,
    reviews: 892,
    guideId: 2,
    guide: 'Kumar Perera',
    highlights: ['Temple of the Tooth', 'Elephant Safari', 'Tea Plantations', 'Cultural Show'],
    description: 'Experience the spiritual heart of Kandy with temple visits and an exciting wildlife safari in the surrounding national parks.',
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Orientation',
        activities: ['Airport transfer', 'Hotel check-in', 'Sunset photography session at Oia']
      },
      {
        day: 2,
        title: 'Blue Domes & Architecture',
        activities: ['Fira architecture tour', 'Blue dome photography', 'Local photography workshop']
      },
      {
        day: 3,
        title: 'Volcanic Landscapes',
        activities: ['Volcano tour', 'Hot springs visit', 'Sunset photography at Imerovigli']
      }
    ],
    included: ['Accommodation', 'Breakfast', 'Transportation', 'Photography guidance', 'Equipment rental'],
    notIncluded: ['International flights', 'Lunch & dinner', 'Travel insurance', 'Personal expenses'],
    availability: ['2024-03-10', '2024-04-15', '2024-05-12', '2024-06-16']
  },
  {
    id: 3,
    title: 'Galle Fort & Beach Adventure',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Galle, Sri Lanka',
    category: 'Historical & Beach',
    price: 65,
    duration: '1 day',
    groupSize: '2-6 people',
    rating: 4.7,
    reviews: 1563,
    guideId: 3,
    guide: 'Sunil Silva',
    highlights: ['Galle Fort', 'Beach Activities', 'Historical Sites', 'Water Sports'],
    description: 'Explore the UNESCO World Heritage Galle Fort and enjoy beach activities along the pristine southern coastline.',
    itinerary: [
      {
        day: 1,
        title: 'Welcome to Kyoto',
        activities: ['Airport pickup', 'Hotel check-in', 'Evening tea ceremony introduction']
      },
      {
        day: 2,
        title: 'Temple Discovery',
        activities: ['Kinkaku-ji (Golden Pavilion)', 'Ryoan-ji Zen garden', 'Traditional tea ceremony']
      },
      {
        day: 3,
        title: 'Cultural Arts',
        activities: ['Traditional crafts workshop', 'Zen meditation session', 'Local market visit']
      }
    ],
    included: ['Accommodation', 'All meals', 'Transportation', 'Cultural activities', 'Tea ceremony materials'],
    notIncluded: ['International flights', 'Travel insurance', 'Personal expenses', 'Optional activities'],
    availability: ['2024-03-20', '2024-04-25', '2024-05-23', '2024-06-27']
  },
  {
    id: 4,
    title: 'Barcelona Architecture & Food',
    image: 'https://images.unsplash.com/photo-1539037114177-4b7b3a15e713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Barcelona, Spain',
    category: 'Food & Culture',
    price: 799,
    duration: '4 days',
    groupSize: '2-10 people',
    rating: 4.8,
    reviews: 945,
    guideId: 4,
    guide: 'Carlos Rodriguez',
    highlights: ['Gaudi Architecture', 'Tapas Tour', 'Wine Tasting', 'Gothic Quarter'],
    description: 'Discover Barcelona\'s architectural wonders and culinary delights with a local expert who knows the city\'s best-kept secrets.',
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Introduction',
        activities: ['Airport transfer', 'Hotel check-in', 'Welcome tapas dinner']
      },
      {
        day: 2,
        title: 'Gaudi Architecture',
        activities: ['Sagrada Familia tour', 'Park Guell visit', 'Casa Batllo exploration']
      },
      {
        day: 3,
        title: 'Culinary Delights',
        activities: ['La Boqueria market tour', 'Wine tasting experience', 'Traditional paella cooking']
      }
    ],
    included: ['Accommodation', 'Breakfast & 2 dinners', 'Transportation', 'Architecture tours', 'Food experiences'],
    notIncluded: ['International flights', 'Lunch', 'Travel insurance', 'Personal expenses'],
    availability: ['2024-03-12', '2024-04-17', '2024-05-15', '2024-06-19']
  }
];

export const mockDestinations = [
  {
    id: 1,
    name: 'Colombo Cultural Hub',
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Sri Lanka',
    rating: 4.8,
    reviews: 1247,
    price: '$45',
    duration: '1 day',
    description: 'Experience the vibrant culture and delicious cuisine of Colombo with visits to ancient temples and bustling markets.'
  },
  {
    id: 2,
    name: 'Kandy Temple & Wildlife',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Sri Lanka',
    rating: 4.9,
    reviews: 892,
    price: '$85',
    duration: '1 day',
    description: 'Discover the spiritual heart of Kandy with temple visits and exciting wildlife safaris in national parks.'
  },
  {
    id: 3,
    name: 'Galle Fort & Beaches',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    location: 'Sri Lanka',
    rating: 4.7,
    reviews: 1563,
    price: '$65',
    duration: '1 day',
    description: 'Explore the UNESCO World Heritage Galle Fort and enjoy pristine southern beaches and water sports.'
  }
];

export const mockCategories = [
  'All Categories',
  'Cultural',
  'Adventure',
  'Photography',
  'Food & Culture',
  'Historical',
  'Nature'
];

export const mockLocations = [
  'All Locations',
  'Colombo, Sri Lanka',
  'Kandy, Sri Lanka',
  'Galle, Sri Lanka',
  'Ella, Sri Lanka',
  'Sigiriya, Sri Lanka',
  'Mirissa, Sri Lanka'
];

export const mockLanguages = [
  'All Languages',
  'English',
  'Spanish',
  'Indonesian',
  'Greek',
  'Japanese',
  'Korean',
  'Catalan',
  'French'
];

export const mockPriceRanges = [
  'All Prices',
  'Under $50',
  '$50-$100',
  '$100-$200',
  'Over $200'
];

export const mockDurations = [
  'All Durations',
  'Half day',
  '1 day',
  '2-3 days',
  '4-6 days',
  '7+ days'
];

// New MVP Features Data
export const mockReviews = [
  {
    id: 1,
    guideId: 1,
    touristName: 'Sarah M.',
    rating: 5,
    comment: 'Priya was amazing! Her knowledge of Colombo\'s food scene was incredible. We tried so many local dishes I never would have found on my own.',
    date: '2024-01-15',
    tourType: 'Food Tour',
    verified: true
  },
  {
    id: 2,
    guideId: 1,
    touristName: 'Michael L.',
    rating: 5,
    comment: 'Excellent cultural tour. Priya speaks perfect Mandarin and made us feel so welcome. Highly recommend!',
    date: '2024-01-10',
    tourType: 'Cultural Tour',
    verified: true
  },
  {
    id: 3,
    guideId: 2,
    touristName: 'Elena R.',
    rating: 5,
    comment: 'Kumar\'s wildlife knowledge is outstanding. We saw elephants, leopards, and so many birds. Perfect day!',
    date: '2024-01-12',
    tourType: 'Wildlife Safari',
    verified: true
  },
  {
    id: 4,
    guideId: 3,
    touristName: 'David K.',
    rating: 4,
    comment: 'Sunil showed us the best spots in Galle Fort. Great historical knowledge and perfect beach recommendations.',
    date: '2024-01-08',
    tourType: 'Historical Tour',
    verified: true
  }
];

export const mockBookings = [
  {
    id: 1,
    guideId: 1,
    touristId: 'tourist_001',
    tourId: 1,
    date: '2024-02-15',
    startTime: '09:00',
    duration: '8 hours',
    participants: 2,
    totalPrice: 90,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingDate: '2024-01-20',
    instantBooking: true
  },
  {
    id: 2,
    guideId: 2,
    touristId: 'tourist_002',
    tourId: 2,
    date: '2024-02-18',
    startTime: '08:00',
    duration: '10 hours',
    participants: 3,
    totalPrice: 255,
    status: 'confirmed',
    paymentStatus: 'escrow',
    bookingDate: '2024-01-22',
    instantBooking: true
  }
];

export const mockPaymentMethods = [
  {
    id: 1,
    name: 'Credit Card',
    icon: '💳',
    secure: true,
    instant: true
  },
  {
    id: 2,
    name: 'PayPal',
    icon: '📱',
    secure: true,
    instant: true
  },
  {
    id: 3,
    name: 'Bank Transfer',
    icon: '🏦',
    secure: true,
    instant: false
  }
];



export const mockSpecialties = [
  'Wildlife Tours',
  'Cultural Tours', 
  'Food Tours',
  'Adventure Tours',
  'Historical Tours',
  'Beach Tours',
  'Tea Tours',
  'Photography Tours',
  'City Tours',
  'Temple Tours'
];

// Helper functions that can be replaced with API calls
export const getGuides = () => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockGuides), 500);
  });
};

export const getTours = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTours), 500);
  });
};

export const getGuideById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const guide = mockGuides.find(g => g.id === parseInt(id));
      resolve(guide || null);
    }, 500);
  });
};

export const getTourById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tour = mockTours.find(t => t.id === parseInt(id));
      resolve(tour || null);
    }, 500);
  });
};

export const searchGuides = (filters) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = mockGuides;
      
      if (filters.searchTerm) {
        filtered = filtered.filter(guide => 
          guide.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          guide.bio.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }
      
      if (filters.location && filters.location !== 'All Locations') {
        filtered = filtered.filter(guide => guide.location === filters.location);
      }
      
      if (filters.language && filters.language !== 'All Languages') {
        filtered = filtered.filter(guide => guide.languages.includes(filters.language));
      }

      if (filters.specialty && filters.specialty !== 'All Specialties') {
        filtered = filtered.filter(guide => guide.specialties.includes(filters.specialty));
      }
      
      resolve(filtered);
    }, 500);
  });
};

export const searchTours = (filters) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = mockTours;
      
      if (filters.searchTerm) {
        filtered = filtered.filter(tour => 
          tour.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          tour.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }
      
      if (filters.category && filters.category !== 'All Categories') {
        filtered = filtered.filter(tour => tour.category === filters.category);
      }
      
      if (filters.priceRange && filters.priceRange !== 'All Prices') {
        filtered = filtered.filter(tour => {
          switch (filters.priceRange) {
            case 'Under $50': return tour.price < 50;
            case '$50-$100': return tour.price >= 50 && tour.price < 100;
            case '$100-$200': return tour.price >= 100 && tour.price < 200;
            case 'Over $200': return tour.price >= 200;
            default: return true;
          }
        });
      }
      
      resolve(filtered);
    }, 500);
  });
};

// New MVP Helper Functions
export const getReviewsByGuideId = (guideId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reviews = mockReviews.filter(review => review.guideId === parseInt(guideId));
      resolve(reviews);
    }, 500);
  });
};

export const createBooking = (bookingData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBooking = {
        id: Date.now(),
        ...bookingData,
        status: 'confirmed',
        paymentStatus: 'escrow',
        bookingDate: new Date().toISOString().split('T')[0],
        instantBooking: true
      };
      resolve(newBooking);
    }, 500);
  });
};

export const getPaymentMethods = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPaymentMethods), 300);
  });
};

export const getGuidesBySpecialty = (specialty) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const guides = mockGuides.filter(guide => 
        guide.specialties.includes(specialty)
      );
      resolve(guides);
    }, 500);
  });
};

export const getGuidesByLanguage = (language) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const guides = mockGuides.filter(guide => 
        guide.languages.includes(language)
      );
      resolve(guides);
    }, 500);
  });
};

