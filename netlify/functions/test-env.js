exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      env_check: {
        GOOGLE_APPLICATION_CREDENTIALS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'SET' : 'MISSING',
        GOOGLE_ANALYTICS_PROPERTY_ID: !!process.env.GOOGLE_ANALYTICS_PROPERTY_ID ? 'SET' : 'MISSING', 
        GOOGLE_PAGESPEED_API_KEY: !!process.env.GOOGLE_PAGESPEED_API_KEY ? 'SET' : 'MISSING',
        SITE_URL: !!process.env.SITE_URL ? 'SET' : 'MISSING',
        SERPAPI_KEY: !!process.env.SERPAPI_KEY ? 'SET' : 'MISSING',
        // Mostra anche i valori parziali per debug (senza esporre i segreti completi)
        GOOGLE_ANALYTICS_PROPERTY_ID_VALUE: process.env.GOOGLE_ANALYTICS_PROPERTY_ID || 'MISSING',
        SITE_URL_VALUE: process.env.SITE_URL || 'MISSING',
        SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 
          JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS).client_email : 'MISSING'
      }
    })
  };
};