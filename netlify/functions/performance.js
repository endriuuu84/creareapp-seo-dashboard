const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    if (!process.env.GOOGLE_PAGESPEED_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Google PageSpeed API key non configurata'
        })
      };
    }

    const siteUrl = process.env.SITE_URL || 'https://www.creareapp.it';
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

    // Analisi mobile
    const mobileResponse = await axios.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed', {
      params: {
        url: siteUrl,
        key: apiKey,
        strategy: 'mobile',
        category: ['performance', 'seo', 'accessibility']
      }
    });

    // Analisi desktop
    const desktopResponse = await axios.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed', {
      params: {
        url: siteUrl,
        key: apiKey,
        strategy: 'desktop', 
        category: ['performance', 'seo', 'accessibility']
      }
    });

    // Estrai metriche mobile
    const mobileData = mobileResponse.data;
    const mobileLighthouse = mobileData.lighthouseResult;
    const mobileMetrics = mobileLighthouse.audits;

    // Estrai metriche desktop
    const desktopData = desktopResponse.data;
    const desktopLighthouse = desktopData.lighthouseResult;

    const performanceData = {
      mobile: {
        performance: Math.round(mobileLighthouse.categories.performance.score * 100),
        seo: Math.round(mobileLighthouse.categories.seo.score * 100),
        accessibility: Math.round(mobileLighthouse.categories.accessibility.score * 100),
        metrics: {
          FCP: mobileMetrics['first-contentful-paint']?.displayValue || 'N/A',
          LCP: mobileMetrics['largest-contentful-paint']?.displayValue || 'N/A',
          CLS: mobileMetrics['cumulative-layout-shift']?.displayValue || 'N/A',
          TTI: mobileMetrics['interactive']?.displayValue || 'N/A',
          TBT: mobileMetrics['total-blocking-time']?.displayValue || 'N/A'
        }
      },
      desktop: {
        performance: Math.round(desktopLighthouse.categories.performance.score * 100),
        seo: Math.round(desktopLighthouse.categories.seo.score * 100),
        accessibility: Math.round(desktopLighthouse.categories.accessibility.score * 100)
      },
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(performanceData)
    };

  } catch (error) {
    console.error('Errore API Performance:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Errore nel caricamento dei dati performance reali',
        details: error.message
      })
    };
  }
};