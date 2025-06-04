// Simplified version without @google-analytics/data dependency for now
exports.handler = async (event, context) => {
  try {
    console.log('📊 Traffic function called');
    console.log('🔑 Analytics Property ID:', process.env.GOOGLE_ANALYTICS_PROPERTY_ID);
    
    // For now, return placeholder data until we properly configure Service Account
    const trafficData = {
      error: 'Analytics API requires Service Account configuration',
      debug: {
        hasPropertyId: !!process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
        note: 'Service Account JSON needed for Analytics Data API'
      },
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(trafficData)
    };

  } catch (error) {
    console.error('❌ Error in traffic function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Errore nel caricamento dei dati traffico',
        details: error.message,
        debug: {
          hasPropertyId: !!process.env.GOOGLE_ANALYTICS_PROPERTY_ID
        }
      })
    };
  }
};