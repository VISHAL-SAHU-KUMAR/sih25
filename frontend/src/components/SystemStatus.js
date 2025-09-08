import React, { useState, useEffect } from 'react';
import { checkSystemHealth } from '../utils/api';
import './SystemStatus.css';

const SystemStatus = () => {
  const [systemHealth, setSystemHealth] = useState({
    auth: 'checking',
    symptom: 'checking',
    prescription: 'checking',
    overall: 'checking'
  });
  const [isVisible, setIsVisible] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    try {
      const health = await checkSystemHealth();
      setSystemHealth(health);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setSystemHealth({
        auth: 'error',
        symptom: 'error',
        prescription: 'error',
        overall: 'error'
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'OK':
        return '✅';
      case 'degraded':
      case 'unhealthy':
        return '⚠️';
      case 'error':
      case 'unavailable':
        return '❌';
      case 'checking':
      default:
        return '🔄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'OK':
        return '#4CAF50';
      case 'degraded':
      case 'unhealthy':
        return '#FF9800';
      case 'error':
      case 'unavailable':
        return '#F44336';
      case 'checking':
      default:
        return '#2196F3';
    }
  };

  const services = [
    {
      name: 'Authentication',
      status: systemHealth.auth,
      url: 'http://localhost:3000/health',
      description: 'User login and registration'
    },
    {
      name: 'Symptom Checker',
      status: systemHealth.symptom,
      url: 'http://localhost:5000/health',
      description: 'AI-powered symptom analysis'
    },
    {
      name: 'Prescription Analyzer',
      status: systemHealth.prescription,
      url: 'http://localhost:8000/health',
      description: 'OCR prescription processing'
    }
  ];

  if (!isVisible) {
    return (
      <div className="system-status-indicator" onClick={() => setIsVisible(true)}>
        <span 
          className="status-dot" 
          style={{ backgroundColor: getStatusColor(systemHealth.overall) }}
          title="Click to view system status"
        >
          {getStatusIcon(systemHealth.overall)}
        </span>
      </div>
    );
  }

  return (
    <div className="system-status-panel">
      <div className="status-header">
        <h3>System Status</h3>
        <div className="status-controls">
          <button onClick={checkHealth} className="refresh-btn" title="Refresh status">
            🔄
          </button>
          <button onClick={() => setIsVisible(false)} className="close-btn" title="Close panel">
            ✕
          </button>
        </div>
      </div>
      
      <div className="overall-status">
        <div 
          className="overall-indicator"
          style={{ backgroundColor: getStatusColor(systemHealth.overall) }}
        >
          <span className="status-icon">{getStatusIcon(systemHealth.overall)}</span>
          <span className="status-text">
            System: {systemHealth.overall === 'healthy' ? 'All Services Online' : 
                    systemHealth.overall === 'degraded' ? 'Some Issues Detected' :
                    systemHealth.overall === 'error' ? 'Service Errors' : 'Checking...'}
          </span>
        </div>
      </div>

      <div className="services-list">
        {services.map((service, index) => (
          <div key={index} className="service-item">
            <div className="service-info">
              <div className="service-name">
                <span className="service-icon">{getStatusIcon(service.status)}</span>
                <span className="service-title">{service.name}</span>
              </div>
              <div className="service-description">{service.description}</div>
            </div>
            <div className="service-status">
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: getStatusColor(service.status),
                  color: 'white'
                }}
              >
                {service.status}
              </span>
              <a 
                href={service.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="service-link"
                title="Open service health endpoint"
              >
                🔗
              </a>
            </div>
          </div>
        ))}
      </div>

      {lastChecked && (
        <div className="last-checked">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}

      <div className="quick-actions">
        <button 
          onClick={() => window.open('http://localhost:8000/docs', '_blank')}
          className="action-btn"
        >
          📚 API Docs
        </button>
        <button 
          onClick={() => window.open('http://localhost:5000', '_blank')}
          className="action-btn"
        >
          🩺 Symptom Checker
        </button>
      </div>
    </div>
  );
};

export default SystemStatus;