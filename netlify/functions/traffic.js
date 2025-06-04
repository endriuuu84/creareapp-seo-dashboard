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

    // Now try to call the actual Analytics API
    console.log('🔧 Creating Google Auth client...');
    
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly']
    });

    const authClient = await auth.getClient();
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

    console.log('📊 Calling Analytics API...');
    
    // Chiamata diretta all'API Google Analytics Data
    const axios = require('axios');
    const accessToken = await authClient.getAccessToken();
    
    const analyticsResponse = await axios.post(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        dateRanges: [
          {
            startDate: '30daysAgo',
            endDate: 'today'
          }
        ],
        dimensions: [
          { name: 'sessionDefaultChannelGrouping' },
          { name: 'pagePath' }
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'users' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionDefaultChannelGrouping',
            stringFilter: {
              value: 'Organic Search'
            }
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ Analytics API response received');

    let organicSessions = 0;
    let organicUsers = 0;
    let totalBounceRate = 0;
    let totalAvgDuration = 0;
    const topPages = {};
    
    if (analyticsResponse.data.rows) {
      analyticsResponse.data.rows.forEach(row => {
        const sessions = parseInt(row.metricValues[0].value) || 0;
        const users = parseInt(row.metricValues[1].value) || 0;
        const bounceRate = parseFloat(row.metricValues[2].value) || 0;
        const avgDuration = parseFloat(row.metricValues[3].value) || 0;
        const pagePath = row.dimensionValues[1].value;
        
        organicSessions += sessions;
        organicUsers += users;
        totalBounceRate += bounceRate * sessions;
        totalAvgDuration += avgDuration * sessions;
        
        if (topPages[pagePath]) {
          topPages[pagePath] += sessions;
        } else {
          topPages[pagePath] = sessions;
        }
      });
    }
    
    // Calcola medie ponderate
    const avgBounceRate = organicSessions > 0 ? (totalBounceRate / organicSessions).toFixed(1) : '0.0';
    const avgSessionDuration = organicSessions > 0 ? 
      Math.floor(totalAvgDuration / organicSessions) : 0;
    
    // Formatta durata in mm:ss
    const minutes = Math.floor(avgSessionDuration / 60);
    const seconds = avgSessionDuration % 60;
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Top 3 pagine per sessioni
    const sortedPages = Object.entries(topPages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([page, sessions]) => ({ page, sessions }));

    const trafficData = {
      organicSessions,
      organicUsers,
      bounceRate: avgBounceRate,
      avgSessionDuration: formattedDuration,
      topPages: sortedPages,
      timestamp: new Date().toISOString()
    };

    console.log(`📊 Processed Analytics data: ${organicSessions} sessions, ${organicUsers} users`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(trafficData)
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