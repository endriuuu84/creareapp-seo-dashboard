const { google } = require('googleapis');

exports.handler = async (event, context) => {
  try {
    // Verifica che le credenziali siano configurate
    if (!process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || 
        !process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Google Search Console credentials non configurate'
        })
      };
    }

    // Configurazione OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID,
      process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob'
    );

    // Per ora utilizziamo API key per PageSpeed (semplificato)
    const searchconsole = google.searchconsole({ 
      version: 'v1', 
      auth: process.env.GOOGLE_PAGESPEED_API_KEY 
    });

    const siteUrl = process.env.SITE_URL || 'https://www.creareapp.it';
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Richiesta dati keyword reali
    const response = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 100,
        dataState: 'final'
      }
    });

    // Formatta dati per il frontend
    const keywords = {};
    
    if (response.data.rows) {
      response.data.rows.forEach(row => {
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(keywords)
    };

  } catch (error) {
    console.error('Errore API Keywords:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Errore nel caricamento dei dati keyword reali',
        details: error.message
      })
    };
  }
};