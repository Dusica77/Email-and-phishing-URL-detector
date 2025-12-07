import React, { useState, useEffect } from 'react';

const SecurityScore = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get email from URL params or prompt
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      analyzeSecurity(emailParam);
    }
  }, []);

  const analyzeSecurity = async (emailToAnalyze = email) => {
    if (!emailToAnalyze) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/security-score/${encodeURIComponent(emailToAnalyze)}`);
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-icon">
          <i className="fas fa-chart-line"></i>
        </div>
        <h1>Security Analysis</h1>
        <p className="page-subtitle">
          Comprehensive security scoring and detailed email analysis
        </p>
      </div>

      <div className="content-card">
        {!analysis && (
          <div className="input-section">
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-envelope"></i> Enter Email for Analysis
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button 
              className="btn btn-primary btn-center"
              onClick={() => analyzeSecurity()}
              disabled={loading}
            >
              {loading ? (
                <div className="loading"></div>
              ) : (
                <i className="fas fa-chart-line"></i>
              )}
              <span>{loading ? 'Analyzing...' : 'Analyze Security'}</span>
            </button>
          </div>
        )}

        {analysis && (
          <div className="analysis-section">
            <div className="score-visualization">
              <div className={`score-circle ${getScoreClass(analysis.score)}`}
                style={{'--score-percent': `${analysis.score}%`}}>
                <div className="score-inner">
                  <span className="score-value">{analysis.score}%</span>
                  <span className="score-label">{getScoreLabel(analysis.score)}</span>
                </div>
              </div>
            </div>

            <div className="analysis-details">
              <h3 className="details-title">
                <i className="fas fa-list-alt"></i> Security Breakdown
              </h3>
              
              <div className="details-grid">
                <div className="detail-card">
                  <div className="detail-icon" style={{background: analysis.valid ? '#10b981' : '#ef4444'}}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-name">Email Format</span>
                    <span className={`detail-value ${analysis.valid ? 'value-success' : 'value-error'}`}>
                      {analysis.valid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon" style={{background: !analysis.is_phishing ? '#10b981' : '#ef4444'}}>
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-name">Phishing Protection</span>
                    <span className={`detail-value ${!analysis.is_phishing ? 'value-success' : 'value-error'}`}>
                      {!analysis.is_phishing ? 'Protected' : 'At Risk'}
                    </span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon" style={{background: analysis.mx_valid ? '#10b981' : '#f59e0b'}}>
                    <i className="fas fa-server"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-name">Email Service</span>
                    <span className={`detail-value ${analysis.mx_valid ? 'value-success' : 'value-warning'}`}>
                      {analysis.mx_valid ? 'Configured' : 'Needs Setup'}
                    </span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon" style={{background: analysis.domain_type === 'trusted' ? '#10b981' : '#f59e0b'}}>
                    <i className="fas fa-globe"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-name">Domain Trust</span>
                    <span className={`detail-value ${analysis.domain_type === 'trusted' ? 'value-success' : 'value-warning'}`}>
                      {analysis.domain_type === 'trusted' ? 'Trusted' : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {analysis.detailed_analysis && (
              <div className="score-breakdown">
                <h3 className="breakdown-title">
                  <i className="fas fa-chart-pie"></i> Score Breakdown
                </h3>
                <div className="breakdown-bars">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Format Validation</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{
                          width: `${analysis.detailed_analysis.format_score}%`,
                          backgroundColor: '#10b981'
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-value">{analysis.detailed_analysis.format_score}%</span>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Domain Trust</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{
                          width: `${analysis.detailed_analysis.domain_score}%`,
                          backgroundColor: '#3b82f6'
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-value">{analysis.detailed_analysis.domain_score}%</span>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Service Configuration</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{
                          width: `${analysis.detailed_analysis.mx_score}%`,
                          backgroundColor: '#f59e0b'
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-value">{analysis.detailed_analysis.mx_score}%</span>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Phishing Protection</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{
                          width: `${analysis.detailed_analysis.phishing_protection_score}%`,
                          backgroundColor: '#ef4444'
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-value">{analysis.detailed_analysis.phishing_protection_score}%</span>
                  </div>
                </div>
              </div>
            )}

            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="recommendations-section">
                <h3 className="recommendations-title">
                  <i className="fas fa-lightbulb"></i> Improvement Suggestions
                </h3>
                <div className="recommendations-grid">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-card">
                      <i className="fas fa-chevron-right"></i>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="social-integration">
              <h3 className="social-title">
                <i className="fas fa-share-alt"></i> Security Integration
              </h3>
              <p className="social-subtitle">Enhance your email security with these tools</p>
              <div className="social-links">
                <a href="#" className="social-link">
                  <i className="fas fa-lock"></i>
                  <span>Password Manager</span>
                </a>
                <a href="#" className="social-link">
                  <i className="fas fa-shield-alt"></i>
                  <span>2FA Setup</span>
                </a>
                <a href="#" className="social-link">
                  <i className="fas fa-eye"></i>
                  <span>Monitor Activity</span>
                </a>
                <a href="#" className="social-link">
                  <i className="fas fa-bell"></i>
                  <span>Security Alerts</span>
                </a>
              </div>
            </div>
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
        
        {analysis && (
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('validator')}
          >
            <i className="fas fa-envelope"></i>
            <span>Validate Another Email</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SecurityScore;