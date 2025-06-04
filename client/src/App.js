import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [seoData, setSeoData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const loadSeoData = async () => {
    try {
      setIsLoading(true);
      
      // Carica SOLO dati reali dalle API - nessun dato finto
      const realApiData = await Promise.allSettled([
        fetchKeywordRankings(),
        fetchPerformanceData(), 
        fetchTrafficData(),
        fetchCrawlErrors(),
        fetchCompetitorData()
      ]);
      
      const [keywordsResult, performanceResult, trafficResult, crawlResult, competitorResult] = realApiData;
      
      const seoData = {
        keywords: keywordsResult.status === 'fulfilled' ? keywordsResult.value : null,
        performance: performanceResult.status === 'fulfilled' ? performanceResult.value : null,
        traffic: trafficResult.status === 'fulfilled' ? trafficResult.value : null,
        crawlErrors: crawlResult.status === 'fulfilled' ? crawlResult.value : null,
        competitors: competitorResult.status === 'fulfilled' ? competitorResult.value : null,
        timestamp: new Date().toISOString()
      };
      
      setSeoData(seoData);
      setIsConnected(true);
      setIsLoading(false);
      
      // Genera alerts solo per dati reali ricevuti
      if (seoData.keywords || seoData.performance) {
        const newAlerts = generateAlerts(seoData);
        setAlerts(prev => [...prev, ...newAlerts].slice(-10));
      }
      
    } catch (error) {
      console.error('❌ Errore caricamento dati SEO reali:', error);
      setIsConnected(false);
      setIsLoading(false);
      
      setAlerts(prev => [...prev, {
        type: 'error',
        message: 'Errore nel caricamento dei dati reali dalle API',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Fetch real keyword rankings from Search Console
  const fetchKeywordRankings = async () => {
    const response = await fetch('/api/keywords');
    if (!response.ok) throw new Error('Keywords API non disponibile');
    return response.json();
  };

  // Fetch real performance data from PageSpeed Insights
  const fetchPerformanceData = async () => {
    const response = await fetch('/api/performance');
    if (!response.ok) throw new Error('Performance API non disponibile');
    return response.json();
  };

  // Fetch real traffic data from Google Analytics
  const fetchTrafficData = async () => {
    const response = await fetch('/api/traffic');
    if (!response.ok) throw new Error('Analytics API non disponibile');
    return response.json();
  };

  // Fetch real crawl errors from Search Console
  const fetchCrawlErrors = async () => {
    const response = await fetch('/api/crawl-errors');
    if (!response.ok) throw new Error('Search Console API non disponibile');
    return response.json();
  };

  // Fetch real competitor data from SERPApi
  const fetchCompetitorData = async () => {
    const response = await fetch('/api/competitors');
    if (!response.ok) throw new Error('Competitor API non disponibile');
    return response.json();
  };

  useEffect(() => {
    // Carica dati SEO reali dalle API
    loadSeoData();
    
    // Auto-refresh ogni 30 minuti
    const refreshInterval = setInterval(loadSeoData, 30 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const generateAlerts = (data) => {
    const alerts = [];
    
    if (data.keywords) {
      Object.entries(data.keywords).forEach(([keyword, keywordData]) => {
        if (keywordData.position && keywordData.position <= 3) {
          alerts.push({
            type: 'success',
            message: `🎉 "${keyword}" in TOP 3 (posizione ${keywordData.position})`,
            timestamp: new Date().toISOString()
          });
        }
      });
    }
    
    if (data.performance?.mobile?.performance < 50) {
      alerts.push({
        type: 'warning',
        message: `⚠️ Performance mobile bassa: ${data.performance.mobile.performance}/100`,
        timestamp: new Date().toISOString()
      });
    }
    
    return alerts;
  };

  const requestUpdate = () => {
    loadSeoData();
    setAlerts(prev => [...prev, {
      type: 'info',
      message: '🔄 Aggiornamento manuale in corso...',
      timestamp: new Date().toISOString()
    }]);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Header 
        isConnected={isConnected}
        onRefresh={requestUpdate}
        lastUpdate={seoData?.timestamp}
      />
      
      <Dashboard 
        data={seoData}
        alerts={alerts}
        onClearAlerts={() => setAlerts([])}
      />
    </div>
  );
}

export default App;