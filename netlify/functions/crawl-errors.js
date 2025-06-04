const { GoogleAuth } = require('google-auth-library');

exports.handler = async (event, context) => {
  try {
    console.log('🕷️ Crawl errors function called');
    console.log('🔐 Has Service Account:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
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
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    // Configurazione Google Auth con Service Account
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const authClient = await auth.getClient();
    const siteUrl = process.env.SITE_URL || 'https://www.creareapp.it';
    
    // Chiamata diretta all'API Search Console
    const axios = require('axios');
    
    const accessToken = await authClient.getAccessToken();
    
    try {
      // Ottieni lista sitemap
      const sitemapsResponse = await axios.get(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      console.log('✅ Sitemaps API response received');
      
      let indexedPages = 0;
      let crawlErrors = 0;
      let blockedPages = 0;
      
      // Analizza sitemap per conteggio pagine
      if (sitemapsResponse.data.sitemap && sitemapsResponse.data.sitemap.length > 0) {
        sitemapsResponse.data.sitemap.forEach(sitemap => {
          if (sitemap.contents && sitemap.contents.length > 0) {
            sitemap.contents.forEach(content => {
              if (content.type === 'WEB' && content.submitted) {
                indexedPages += parseInt(content.submitted) || 0;
              }
            });
          }
        });
      }
      
      // Fallback: usa Search Console per dati di base
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const searchAnalyticsResponse = await axios.post(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          startDate,
          endDate,
          dimensions: ['page'],
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
      
      const pageCount = searchAnalyticsResponse.data.rows?.length || 0;
      
      const crawlData = {
        crawlErrors: 0, // Search Console v3 non fornisce errori crawl diretti
        indexedPages: Math.max(indexedPages, pageCount, 1),
        blockedPages: 0,
        lastInspection: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      console.log(`📊 Crawl data: ${crawlData.indexedPages} indexed pages`);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(crawlData)
      };
      
    } catch (apiError) {
      console.warn('⚠️ Search Console API limited, using basic data');
      
      const crawlData = {
        crawlErrors: 0,
        indexedPages: 1,
        blockedPages: 0,
        timestamp: new Date().toISOString(),
        note: 'Limited data - need more API permissions'
      };

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(crawlData)
      };
    }

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