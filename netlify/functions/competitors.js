exports.handler = async (event, context) => {
  try {
    console.log('🏆 Competitors function called');
    console.log('🔑 Has SERPAPI_KEY:', !!process.env.SERPAPI_KEY);
    
    if (!process.env.SERPAPI_KEY) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'SERPAPI_KEY not configured',
          debug: {
            hasSerpApiKey: false,
            note: 'Sign up at serpapi.com to get API key for competitor analysis'
          },
          timestamp: new Date().toISOString()
        })
      };
    }

    // If we have SERPAPI_KEY, we could implement real competitor analysis here
    const competitorData = {
      error: 'Competitor analysis not yet implemented',
      debug: {
        hasSerpApiKey: true,
        note: 'SERPAPI integration ready, implementation pending'
      },
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(competitorData)
    };

  } catch (error) {
    console.error('❌ Error in competitors function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Errore nel caricamento dei dati competitor',
        details: error.message,
        debug: {
          hasSerpApiKey: !!process.env.SERPAPI_KEY
        }
      })
    };
  }
};