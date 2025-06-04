// Simplified version without googleapis dependency for now
exports.handler = async (event, context) => {
  try {
    console.log('🔍 Keywords function called');
    console.log('🔑 Has Client ID:', !!process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID);
    console.log('🔐 Has Client Secret:', !!process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET);
    
    // For now, return placeholder data until we properly configure OAuth
    const keywordsData = {
      error: 'Search Console API requires OAuth configuration',
      debug: {
        hasClientId: !!process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET,
        note: 'OAuth flow needed for Search Console API'
      },
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(keywordsData)
    };

  } catch (error) {
    console.error('❌ Error in keywords function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Errore nel caricamento dei dati keyword',
        details: error.message,
        debug: {
          hasClientId: !!process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID,
          hasClientSecret: !!process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET
        }
      })
    };
  }
};