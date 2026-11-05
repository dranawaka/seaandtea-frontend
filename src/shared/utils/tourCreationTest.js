// Tour Creation Test Utility
// This file contains test functions to verify the tour creation API integration

export const testTourCreationAPI = async (token) => {
  const testTourData = {
    title: "Test Tea Tour",
    description: "A comprehensive test tour to verify the API integration. This tour will take you through the beautiful tea plantations of Sri Lanka, where you'll learn about the tea making process from leaf to cup.",
    category: "TEA_TOURS",
    durationHours: 4,
    maxGroupSize: 10,
    pricePerPerson: 75.00,
    instantBooking: false,
    securePayment: true,
    languages: ["English"],
    highlights: ["Tea plantation visit", "Tea factory tour", "Traditional tea ceremony"],
    includedItems: ["Professional guide", "Transportation", "Tea tasting"],
    excludedItems: ["Personal expenses", "Tips"],
    meetingPoint: "Kandy Railway Station",
    cancellationPolicy: "Free cancellation up to 24 hours before the tour",
    imageUrls: [],
    primaryImageIndex: 0
  };

  try {
    const response = await fetch('https://seaandtea-backend-production.up.railway.app/api/v1/tours', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testTourData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Tour creation test successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ Tour creation test failed:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Tour creation test error:', error);
    return { success: false, error: error.message };
  }
};

export const testTourRetrievalAPI = async (token) => {
  try {
    const response = await fetch('https://seaandtea-backend-production.up.railway.app/api/v1/tours', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Tour retrieval test successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ Tour retrieval test failed:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Tour retrieval test error:', error);
    return { success: false, error: error.message };
  }
};

// Export test functions for use in development
export const runTourAPITests = async (token) => {
  console.log('🧪 Running tour API tests...');
  
  const creationResult = await testTourCreationAPI(token);
  const retrievalResult = await testTourRetrievalAPI(token);
  
  return {
    creation: creationResult,
    retrieval: retrievalResult
  };
};
