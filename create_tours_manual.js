#!/usr/bin/env node

/**
 * Manual Tour Creation Script for d@guild.com
 * Use this when the automatic login fails due to backend issues
 * 
 * Steps:
 * 1. Log in to the application manually in your browser as d@guild.com
 * 2. Get the auth token from browser's localStorage
 * 3. Run this script with that token
 */

const readline = require('readline');

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://seaandtea-backend-production.up.railway.app/api/v1';

// Same sample tours data as the main script
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

// Function to create a tour
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

// Function to prompt user for token
function promptForToken() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n🔑 Manual Token Required');
    console.log('==========================================');
    console.log('1. Open your browser and go to the Sea & Tea Tours application');
    console.log('2. Log in as d@guild.com (or create the account if it doesn\'t exist)');
    console.log('3. Open Developer Tools (F12)');
    console.log('4. Go to Application → Storage → Local Storage');
    console.log('5. Find "authToken" and copy its value');
    console.log('6. Paste the token below\n');

    rl.question('Enter your authentication token: ', (token) => {
      rl.close();
      resolve(token.trim());
    });
  });
}

// Main function
async function createToursManually() {
  try {
    console.log('🚀 Manual Tour Creation Script');
    console.log(`📡 Using API Base URL: ${API_BASE_URL}`);
    
    let token;
    
    // Check if token was provided as command line argument
    const args = process.argv.slice(2);
    if (args.length > 0 && args[0] !== '--help') {
      token = args[0];
      console.log('✅ Using token from command line');
    } else {
      token = await promptForToken();
    }

    if (!token) {
      console.error('❌ No token provided. Exiting...');
      process.exit(1);
    }

    console.log(`\n📝 Creating ${sampleTours.length} sample tours...`);
    
    const createdTours = [];
    
    for (let i = 0; i < sampleTours.length; i++) {
      const tour = sampleTours[i];
      console.log(`\n🎯 Creating tour ${i + 1}/${sampleTours.length}: "${tour.title}"`);
      
      try {
        const createdTour = await createTour(tour, token);
        createdTours.push(createdTour);
        console.log(`✅ Successfully created: "${tour.title}" (ID: ${createdTour.id || 'Unknown'})`);
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to create tour "${tour.title}":`, error.message);
        
        // If unauthorized, suggest getting a new token
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          console.log('💡 Tip: Your token might be expired. Try getting a fresh token from the browser.');
        }
      }
    }
    
    console.log('\n🎉 Manual tour creation completed!');
    console.log(`✅ Successfully created ${createdTours.length} out of ${sampleTours.length} tours`);
    
    if (createdTours.length > 0) {
      console.log('\n📋 Created tours summary:');
      createdTours.forEach((tour, index) => {
        console.log(`${index + 1}. ${tour.title || tour.name || 'Unknown'} - $${tour.price} (${tour.duration}h, ${tour.category})`);
      });
    }
    
    if (createdTours.length < sampleTours.length) {
      console.log('\n⚠️  Some tours failed to create. Common issues:');
      console.log('   • Token expired - get a fresh token from browser');
      console.log('   • Backend server issues - check server logs');
      console.log('   • Account permissions - ensure d@guild.com has GUIDE role');
    }
    
  } catch (error) {
    console.error('💥 Script execution failed:', error.message);
    process.exit(1);
  }
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Manual Tour Creation Script
==========================

Usage:
  node create_tours_manual.js [TOKEN]
  node create_tours_manual.js --help

Options:
  TOKEN     Your authentication token from the browser
  --help    Show this help message

Examples:
  node create_tours_manual.js
  node create_tours_manual.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

If no token is provided, you'll be prompted to enter it interactively.
`);
  process.exit(0);
}

// Run the script
createToursManually();
