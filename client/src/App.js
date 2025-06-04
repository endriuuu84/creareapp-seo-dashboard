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

  useEffect(() => {
    // Carica dati SEO reali dalle API
    loadSeoData();
    
    // Auto-refresh ogni 30 minuti
    const refreshInterval = setInterval(loadSeoData, 30 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const loadSeoData = async () => {
    try {
      setIsLoading(true);
      
      // Simula caricamento dati reali
      // In produzione queste chiamate andrebbero a API backend o direttamente alle API Google
      const mockRealData = {
        keywords: {
          "sviluppo app mobile": {
            position: 8.5,
            clicks: 24,
            impressions: 450,
            ctr: 5.3,
            timestamp: new Date().toISOString()
          },
          "creare app android": {
            position: 12.1,
            clicks: 18,
            impressions: 320,
            ctr: 5.6,
            timestamp: new Date().toISOString()
          },
          "sviluppo applicazioni mobile": {
            position: 15.3,
            clicks: 12,
            impressions: 280,
            ctr: 4.3,
            timestamp: new Date().toISOString()
          }
        },
        performance: {
          mobile: {
            performance: 78,
            seo: 92,
            accessibility: 85,
            metrics: {
              FCP: "1.8s",
              LCP: "2.4s", 
              CLS: "0.12",
              TTI: "3.2s",
              TBT: "180ms"
            }
          },
          desktop: {
            performance: 89,
            seo: 94,
            accessibility: 88
          },
          timestamp: new Date().toISOString()
        },
        traffic: null, // Richiede Google Analytics API
        crawlErrors: null, // Richiede Search Console API estesa
        competitors: null, // Richiede SERPApi
        timestamp: new Date().toISOString()
      };
      
      setSeoData(mockRealData);
      setIsConnected(true);
      setIsLoading(false);
      
      // Genera alerts per dati significativi
      const newAlerts = generateAlerts(mockRealData);
      setAlerts(prev => [...prev, ...newAlerts].slice(-10));
      
    } catch (error) {
      console.error('❌ Errore caricamento dati SEO:', error);
      setIsConnected(false);
      setIsLoading(false);
      
      setAlerts(prev => [...prev, {
        type: 'error',
        message: 'Errore caricamento dati SEO',
        timestamp: new Date().toISOString()
      }]);
    }
  };

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