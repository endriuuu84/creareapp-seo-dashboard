// Simplified version without googleapis dependency for now
exports.handler = async (event, context) => {
  try {
    console.log('🕷️ Crawl errors function called');
    console.log('🔑 Has Client ID:', !!process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID);
    
    // For now, return placeholder data until we properly configure OAuth
    const crawlData = {
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
      body: JSON.stringify(crawlData)
    };

  } catch (error) {
    console.error('❌ Error in crawl-errors function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Errore nel caricamento dei dati crawl',
        details: error.message
      })
    };
  }
};