const { BetaAnalyticsDataClient } = require('@google-analytics/data');

exports.handler = async (event, context) => {
  try {
    if (!process.env.GOOGLE_ANALYTICS_PROPERTY_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Google Analytics Property ID non configurato'
        })
      };
    }

    // Configurazione Google Analytics Data API
    const analyticsDataClient = new BetaAnalyticsDataClient({
      // In produzione, userai Service Account JSON
      credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 
        JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS) : 
        undefined
    });

    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
    
    // Richiesta dati traffico organico
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
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
    });

    let organicSessions = 0;
    let organicUsers = 0;
    let totalBounceRate = 0;
    let totalAvgDuration = 0;
    const topPages = {};
    
    if (response.rows) {
      response.rows.forEach(row => {
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(trafficData)
    };

  } catch (error) {
    console.error('Errore API Traffic:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Errore nel caricamento dei dati traffico reali',
        details: error.message
      })
    };
  }
};