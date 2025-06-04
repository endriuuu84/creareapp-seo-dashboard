const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    console.log('🔧 Performance function called');
    console.log('🔑 API Key exists:', !!process.env.GOOGLE_PAGESPEED_API_KEY);
    console.log('🌐 Site URL:', process.env.SITE_URL);
    
    if (!process.env.GOOGLE_PAGESPEED_API_KEY) {
      console.error('❌ Missing GOOGLE_PAGESPEED_API_KEY');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Google PageSpeed API key non configurata',
          debug: 'GOOGLE_PAGESPEED_API_KEY not found in environment'
        })
      };
    }

    const siteUrl = process.env.SITE_URL || 'https://www.creareapp.it';
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

    console.log('📊 Testing with URL:', siteUrl);

    // Analisi mobile
    console.log('📱 Calling mobile PageSpeed API...');
    const mobileResponse = await axios.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed', {
      params: {
        url: siteUrl,
        key: apiKey,
        strategy: 'mobile',
        category: ['performance', 'seo', 'accessibility']
      },
      timeout: 30000
    });
    
    console.log('✅ Mobile response received');

    // Analisi desktop
    console.log('💻 Calling desktop PageSpeed API...');
    const desktopResponse = await axios.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed', {
      params: {
        url: siteUrl,
        key: apiKey,
        strategy: 'desktop', 
        category: ['performance', 'seo', 'accessibility']
      },
      timeout: 30000
    });
    
    console.log('✅ Desktop response received');

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
    console.error('❌ Error in performance function:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Errore nel caricamento dei dati performance reali',
        details: error.message,
        debug: {
          status: error.response?.status,
          data: error.response?.data,
          hasApiKey: !!process.env.GOOGLE_PAGESPEED_API_KEY,
          siteUrl: process.env.SITE_URL
        }
      })
    };
  }
};