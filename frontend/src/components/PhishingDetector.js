import React, { useState } from 'react';

const PhishingDetector = ({ onNavigate }) => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const detectPhishing = async () => {
    if (!url) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/detect-phishing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({
        is_phishing: false,
        risk_score: 0,
        warnings: ['Error analyzing URL'],
        domain: 'unknown'
      });
    }
    setLoading(false);
  };

  const getRiskColor = (score) => {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#d97706';
    return '#10b981';
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'Critical Risk';
    if (score >= 60) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const getRiskIcon = (score) => {
    if (score >= 80) return 'fas fa-radiation';
    if (score >= 60) return 'fas fa-exclamation-triangle';
    if (score >= 40) return 'fas fa-exclamation-circle';
    return 'fas fa-check-circle';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-icon">
          <i className="fas fa-fish"></i>
        </div>
        <h1>Phishing URL Detector</h1>
        <p className="page-subtitle">
          Analyze URLs for potential phishing attempts and security threats
        </p>
      </div>

      <div className="content-card">
        <div className="input-section">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-link"></i> Enter URL to Analyze
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <button 
            className="btn btn-primary btn-center"
            onClick={detectPhishing}
            disabled={loading}
          >
            {loading ? (
              <div className="loading"></div>
            ) : (
              <i className="fas fa-search"></i>
            )}
            <span>{loading ? 'Analyzing...' : 'Detect Phishing'}</span>
          </button>
        </div>

        {result && (
          <div className={`result-section ${result.is_phishing ? 'result-danger' : 'result-safe'}`}>
            <div className="result-icon">
              <i 
                className={getRiskIcon(result.risk_score)} 
                style={{color: getRiskColor(result.risk_score)}}
              ></i>
            </div>
            
            <h3 className="result-title" style={{color: getRiskColor(result.risk_score)}}>
              {getRiskLevel(result.risk_score)}
            </h3>
            
            <div className="risk-score-display" style={{
              backgroundColor: getRiskColor(result.risk_score),
            }}>
              <i className="fas fa-chart-bar"></i>
              <span>Risk Score: {result.risk_score}%</span>
            </div>
            
            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">
                  <i className="fas fa-globe"></i> Domain:
                </span>
                <span className="detail-value">{result.domain}</span>
              </div>
              
              {result.source && (
                <div className="detail-row">
                  <span className="detail-label">
                    <i className="fas fa-database"></i> Source:
                  </span>
                  <span className="detail-value">{result.source}</span>
                </div>
              )}
            </div>
            
            {result.warnings.length > 0 && (
              <div className="warnings-section">
                <h4 className="warnings-title">
                  <i className="fas fa-exclamation-triangle"></i> Security Warnings
                </h4>
                <div className="warnings-list">
                  {result.warnings.map((warning, index) => (
                    <div key={index} className="warning-item">
                      <i className="fas fa-chevron-right"></i>
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="page-actions">
        <button 
          className="btn btn-secondary"
          onClick={() => onNavigate('home')}
        >
          <i className="fas fa-arrow-left"></i>
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};

export default PhishingDetector;