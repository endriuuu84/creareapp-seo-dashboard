const { GoogleAuth } = require('google-auth-library');

exports.handler = async (event, context) => {
  try {
    console.log('🔍 Keywords function called');
    console.log('🔐 Has Service Account:', !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    console.log('🌐 Site URL:', process.env.SITE_URL);
    
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Service Account credentials non configurate'
        })
      };
    }

    // Parse service account credentials
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    
    // Configurazione Google Auth con Service Account
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const authClient = await auth.getClient();
    const siteUrl = 'sc-domain:creareapp.it';
    
    // Chiamata diretta all'API Search Console
    const axios = require('axios');
    
    const accessToken = await authClient.getAccessToken();
    
    // Use older dates due to Search Console latency
    const endDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 days ago
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 90 days ago

    console.log('📅 Date range:', startDate, 'to', endDate);
    console.log('🌐 Using site URL:', siteUrl);

    const searchConsoleResponse = await axios.post(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        startDate,
        endDate,
        rowLimit: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ Search Console API response received');
    console.log('📊 Response data:', JSON.stringify(searchConsoleResponse.data, null, 2));

    // Formatta dati per il frontend
    const keywords = {};
    
    if (searchConsoleResponse.data.rows) {
      searchConsoleResponse.data.rows.forEach(row => {
        const keyword = row.keys[0];
        keywords[keyword] = {
          position: row.position || null,
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.ctr ? (row.ctr * 100).toFixed(1) : '0.0',
          timestamp: new Date().toISOString()
        };
      });
    }

    console.log(`📊 Processed ${Object.keys(keywords).length} keywords`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(keywords)
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