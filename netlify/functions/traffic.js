exports.handler = async (event, context) => {
  try {
    console.log('📊 Traffic function called');
    console.log('🔑 Analytics Property ID:', process.env.GOOGLE_ANALYTICS_PROPERTY_ID);
    console.log('🔐 Has Service Account:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    // Test basic functionality first
    if (!process.env.GOOGLE_ANALYTICS_PROPERTY_ID) {
      console.log('❌ Missing GOOGLE_ANALYTICS_PROPERTY_ID');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Google Analytics Property ID non configurato'
        })
      };
    }

    console.log('🔧 Attempting to parse Service Account...');
    
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('❌ Missing GOOGLE_APPLICATION_CREDENTIALS');
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

    // Test JSON parsing
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      console.log('✅ Service Account JSON parsed successfully');
      console.log('📧 Client email:', credentials.client_email);
    } catch (parseError) {
      console.error('❌ Failed to parse Service Account JSON:', parseError.message);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Invalid Service Account JSON format'
        })
      };
    }

    // For now, return success with debug info instead of calling API
    const debugData = {
      status: 'Analytics API ready but requires permissions',
      debug: {
        hasPropertyId: !!process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
        hasCredentials: !!credentials,
        clientEmail: credentials?.client_email,
        note: 'Add this service account to Google Analytics with Viewer permissions'
      },
      timestamp: new Date().toISOString()
    };

    console.log('📊 Returning debug data instead of calling API');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(debugData)
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