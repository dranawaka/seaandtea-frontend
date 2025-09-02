#!/usr/bin/env node

/**
 * Script to create sample tours for d@guild.com
 * Run this script with: node create_sample_tours.js
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

// Sample tours data for d@guild.com
const sampleTours = [
  {
    title: "Ceylon Tea Plantation Discovery",
    description: "Immerse yourself in the world of Ceylon tea with a comprehensive tour of Sri Lanka's most prestigious tea plantations. Learn about the tea-making process from leaf to cup, enjoy tastings of premium teas, and witness the breathtaking landscapes of the central highlands.",
    category: "TEA_TOURS",
    location: "Nuwara Eliya, Sri Lanka",
    duration: "6",
    maxGroupSize: 8,
    price: 75.00,
    difficulty: "EASY",
    includes: [
      "Professional tea plantation guide",
      "Tea factory tour and demonstrations",
      "Premium tea tasting sessions",
      "Traditional Sri Lankan lunch",
      "Transportation from/to Nuwara Eliya",
      "Tea garden walking tour"
    ],
    excludes: [
      "Hotel pickup/drop-off outside Nuwara Eliya",
      "Personal expenses and souvenirs",
      "Travel insurance",
      "Tips and gratuities"
    ],
    requirements: [
      "Comfortable walking shoes required",
      "Weather-appropriate clothing",
      "Basic fitness level for plantation walks",
      "Camera for scenic photography"
    ],
    highlights: [
      "Visit to century-old tea plantation",
      "Learn traditional tea plucking techniques",
      "Professional tea tasting experience",
      "Scenic mountain railway views",
      "Interaction with local tea workers",
      "Purchase premium Ceylon tea direct from source"
    ]
  },
  {
    title: "Mirissa Whale Watching & Beach Bliss",
    description: "Experience the magic of Sri Lanka's southern coast with an unforgettable whale watching adventure followed by relaxation on pristine beaches. Spot blue whales, sperm whales, and dolphins in their natural habitat, then unwind on the golden sands of Mirissa.",
    category: "BEACH_TOURS",
    location: "Mirissa, Sri Lanka",
    duration: "8",
    maxGroupSize: 12,
    price: 95.00,
    difficulty: "EASY",
    includes: [
      "Boat trip for whale watching",
      "Professional marine life guide",
      "Safety equipment and life jackets",
      "Fresh seafood lunch",
      "Beach access and facilities",
      "Snorkeling equipment",
      "Refreshments and water"
    ],
    excludes: [
      "Hotel transfers outside Mirissa area",
      "Seasickness medication",
      "Personal items and souvenirs",
      "Alcohol beverages",
      "Tips for crew and guide"
    ],
    requirements: [
      "Swimming ability recommended",
      "Suitable for all ages",
      "Sun protection (hat, sunscreen)",
      "Comfortable beach clothing",
      "Camera with waterproof case"
    ],
    highlights: [
      "Blue whale and sperm whale sightings",
      "Dolphin pod encounters",
      "Professional marine biology insights",
      "Pristine Mirissa beach relaxation",
      "Fresh seafood dining experience",
      "Snorkeling in coral gardens",
      "Sunset beach photography"
    ]
  },
  {
    title: "Ancient Kandy Cultural Heritage",
    description: "Dive deep into Sri Lanka's rich cultural heritage with a comprehensive tour of Kandy, the last royal capital. Visit the sacred Temple of the Tooth Relic, explore traditional crafts, enjoy cultural performances, and experience the spiritual heart of Buddhist Sri Lanka.",
    category: "CULTURAL_TOURS",
    location: "Kandy, Sri Lanka",
    duration: "7",
    maxGroupSize: 10,
    price: 85.00,
    difficulty: "MODERATE",
    includes: [
      "Temple of the Tooth Relic entrance",
      "Cultural guide and historian",
      "Traditional Kandyan dance show",
      "Royal Botanical Gardens visit",
      "Local craft workshop experience",
      "Traditional Sri Lankan lunch",
      "Transportation within Kandy"
    ],
    excludes: [
      "Hotel accommodation",
      "Meals other than lunch",
      "Photography fees at some temples",
      "Personal shopping and souvenirs",
      "Tips and personal expenses"
    ],
    requirements: [
      "Modest dress code for temples",
      "Shoes that can be easily removed",
      "Respectful behavior in religious sites",
      "Basic walking ability for temple tours",
      "Interest in cultural heritage"
    ],
    highlights: [
      "Sacred Temple of the Tooth Relic",
      "UNESCO World Heritage sites",
      "Traditional Kandyan dance performance",
      "Royal Botanical Gardens exploration",
      "Local artisan workshops",
      "Buddhist monastery interactions",
      "Historical royal palace tours"
    ]
  },
  {
    title: "Sigiriya Rock Fortress Adventure",
    description: "Conquer the legendary Lion Rock of Sigiriya, one of Sri Lanka's most iconic landmarks. This UNESCO World Heritage site offers breathtaking views, ancient frescoes, and fascinating history. Perfect for adventure seekers and history enthusiasts alike.",
    category: "ADVENTURE_TOURS",
    location: "Sigiriya, Sri Lanka",
    duration: "5",
    maxGroupSize: 6,
    price: 65.00,
    difficulty: "CHALLENGING",
    includes: [
      "Sigiriya Rock Fortress entrance fees",
      "Expert archaeological guide",
      "Historical site explanations",
      "Photography assistance",
      "Water and energy snacks",
      "Transportation to/from rock base"
    ],
    excludes: [
      "Hotel pickup outside Sigiriya area",
      "Meals (lunch available nearby)",
      "Personal climbing equipment",
      "Photography equipment",
      "Travel insurance"
    ],
    requirements: [
      "Good physical fitness required",
      "Not suitable for those with heart conditions",
      "Comfortable hiking shoes mandatory",
      "Weather-appropriate clothing",
      "Minimum age 12 years",
      "Ability to climb 1200+ steps"
    ],
    highlights: [
      "Climb the famous Lion Rock",
      "Ancient frescoes viewing",
      "360-degree panoramic views",
      "UNESCO World Heritage exploration",
      "Archaeological site discoveries",
      "Royal palace ruins exploration",
      "Professional historical insights"
    ]
  },
  {
    title: "Colombo Street Food & Market Safari",
    description: "Embark on a culinary adventure through Colombo's vibrant street food scene and bustling markets. Taste authentic Sri Lankan flavors, learn about local spices, and discover hidden food gems known only to locals. A paradise for food lovers!",
    category: "FOOD_TOURS",
    location: "Colombo, Sri Lanka",
    duration: "4",
    maxGroupSize: 8,
    price: 45.00,
    difficulty: "EASY",
    includes: [
      "Expert local food guide",
      "Multiple street food tastings",
      "Spice market tour and explanation",
      "Traditional tea and coffee tasting",
      "Local market exploration",
      "Recipe cards and spice samples"
    ],
    excludes: [
      "Hotel transfers",
      "Full meals (only tastings provided)",
      "Alcoholic beverages",
      "Personal purchases at markets",
      "Tips for vendors and guide"
    ],
    requirements: [
      "Adventurous palate encouraged",
      "Inform guide of any food allergies",
      "Comfortable walking shoes",
      "Small backpack for purchases",
      "Cash for optional market purchases"
    ],
    highlights: [
      "Authentic street food experiences",
      "Local spice market discoveries",
      "Traditional cooking technique insights",
      "Hidden local food spots",
      "Cultural food stories and history",
      "Take-home spice samples",
      "Photography of colorful markets"
    ]
  }
];

// Function to make API call to create a tour
async function createTour(tourData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/tours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tourData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create tour: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const createdTour = await response.json();
    return createdTour;
  } catch (error) {
    console.error('Error creating tour:', error);
    throw error;
  }
}

// Function to login and get token for d@guild.com
async function loginAsGuide() {
  try {
    console.log('🔐 Attempting to login as d@guild.com...');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'd@guild.com',
        password: '1qaz2wsx@X@' // You may need to adjust this password
      })
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = `${errorMessage} - Unable to parse error response`;
      }
      
      // Provide specific guidance based on error type
      if (response.status === 500) {
        throw new Error(`Server Error (500): The backend is experiencing issues. Please check:\n` +
          `  1. Backend server logs for detailed error information\n` +
          `  2. Database connection status\n` +
          `  3. Account 'd@guild.com' exists in the database\n` +
          `  4. Try using the manual token option instead`);
      } else if (response.status === 401) {
        throw new Error(`Authentication failed (401): Invalid credentials for 'd@guild.com'\n` +
          `  1. Check if the account exists\n` +
          `  2. Try password: 'password123' or check the correct password\n` +
          `  3. Ensure the account has GUIDE role`);
      } else {
        throw new Error(`Login failed: ${response.status} - ${errorMessage}`);
      }
    }

    const loginData = await response.json();
    console.log('✅ Login successful!');
    return loginData.token || loginData.accessToken;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

// Main function to create all sample tours
async function createSampleTours() {
  try {
    console.log('🚀 Starting sample tour creation process...');
    console.log(`📡 Using API Base URL: ${API_BASE_URL}`);
    
    // Login to get authentication token
    const token = await loginAsGuide();
    
    console.log(`📝 Creating ${sampleTours.length} sample tours...`);
    
    const createdTours = [];
    
    for (let i = 0; i < sampleTours.length; i++) {
      const tour = sampleTours[i];
      console.log(`\n🎯 Creating tour ${i + 1}/${sampleTours.length}: "${tour.title}"`);
      
      try {
        const createdTour = await createTour(tour, token);
        createdTours.push(createdTour);
        console.log(`✅ Successfully created: "${tour.title}" (ID: ${createdTour.id})`);
        
        // Add a small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to create tour "${tour.title}":`, error.message);
      }
    }
    
    console.log('\n🎉 Sample tour creation completed!');
    console.log(`✅ Successfully created ${createdTours.length} out of ${sampleTours.length} tours`);
    
    if (createdTours.length > 0) {
      console.log('\n📋 Created tours summary:');
      createdTours.forEach((tour, index) => {
        console.log(`${index + 1}. ${tour.title} - $${tour.price} (${tour.duration}h, ${tour.category})`);
      });
    }
    
    return createdTours;
    
  } catch (error) {
    console.error('💥 Script execution failed:', error.message);
    process.exit(1);
  }
}

// Alternative function to create tours manually (if you have a token)
async function createToursWithToken(authToken) {
  console.log('🚀 Creating tours with provided token...');
  
  const createdTours = [];
  
  for (let i = 0; i < sampleTours.length; i++) {
    const tour = sampleTours[i];
    console.log(`\n🎯 Creating tour ${i + 1}/${sampleTours.length}: "${tour.title}"`);
    
    try {
      const createdTour = await createTour(tour, authToken);
      createdTours.push(createdTour);
      console.log(`✅ Successfully created: "${tour.title}" (ID: ${createdTour.id})`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to create tour "${tour.title}":`, error.message);
    }
  }
  
  console.log(`\n🎉 Created ${createdTours.length} tours successfully!`);
  return createdTours;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createSampleTours,
    createToursWithToken,
    sampleTours,
    loginAsGuide,
    createTour
  };
}

// Run the script if called directly
if (require.main === module) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === '--token') {
    if (args[1]) {
      createToursWithToken(args[1]);
    } else {
      console.error('❌ Please provide a token when using --token flag');
      console.log('Usage: node create_sample_tours.js --token YOUR_AUTH_TOKEN');
      process.exit(1);
    }
  } else {
    createSampleTours();
  }
}
