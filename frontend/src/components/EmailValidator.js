import React, { useState } from 'react';

const EmailValidator = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [similarEmails, setSimilarEmails] = useState([]);

  const validateEmail = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/validate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      setResult(data);
      setSimilarEmails(data.similar_emails || []);
    } catch (error) {
      console.error('Error:', error);
      setResult({
        valid: false,
        message: 'Error validating email',
        score: 0,
        is_phishing: false
      });
      setSimilarEmails([]);
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getStatusIcon = (result) => {
    if (result.is_phishing) return 'fas fa-skull-crossbones';
    if (result.valid) return 'fas fa-check-circle';
    return 'fas fa-exclamation-triangle';
  };

  const getStatusColor = (result) => {
    if (result.is_phishing) return '#ef4444';
    if (result.valid) return '#10b981';
    return '#f59e0b';
  };

  const getStatusText = (result) => {
    if (result.is_phishing) return 'Phishing Detected';
    if (result.valid) return 'Valid Email';
    return 'Validation Warning';
  };

  const navigateToSecurity = () => {
    if (result && !result.is_phishing) {
      onNavigate('security');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-icon">
          <i className="fas fa-envelope"></i>
        </div>
        <h1>Email Validator</h1>
        <p className="page-subtitle">
          Comprehensive email validation with domain authentication and security analysis
        </p>
      </div>

      <div className="content-card">
        <div className="input-section">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-envelope"></i> Enter Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="input-hint">
              <i className="fas fa-lightbulb"></i>
              Try: user@gmail.com, admin@atria.edu.com, or test@gmail-security-verify.com
            </div>
          </div>
          
          <button 
            className="btn btn-primary btn-center"
            onClick={validateEmail}
            disabled={loading}
          >
            {loading ? (
              <div className="loading"></div>
            ) : (
              <i className="fas fa-check-circle"></i>
            )}
            <span>{loading ? 'Validating...' : 'Validate Email'}</span>
          </button>
        </div>

        {result && (
          <div className="results-container">
            <div className={`result-section ${
              result.is_phishing ? 'result-danger' : 
              result.valid ? 'result-success' : 'result-warning'
            }`}>
              <div className="result-icon">
                <i 
                  className={getStatusIcon(result)} 
                  style={{color: getStatusColor(result)}}
                ></i>
              </div>
              
              <h3 className="result-title" style={{color: getStatusColor(result)}}>
                {getStatusText(result)}
              </h3>
              
              <p className="result-message">{result.message}</p>
              
              {!result.is_phishing && (
                <div className="score-display" style={{
                  backgroundColor: getScoreColor(result.score),
                }}>
                  <i className="fas fa-shield-alt"></i>
                  <span>Security Score: {result.score}% - {getScoreLevel(result.score)}</span>
                </div>
              )}
              
              <div className="result-details">
                <div className="detail-row">
                  <span className="detail-label">
                    <i className="fas fa-globe"></i> Domain:
                  </span>
                  <span className="detail-value">{result.domain}</span>
                </div>
                
                {result.domain_type && (
                  <div className="detail-row">
                    <span className="detail-label">
                      <i className="fas fa-tag"></i> Type:
                    </span>
                    <span className="detail-value" style={{
                      color: result.domain_type === 'trusted' ? '#10b981' : 
                             result.domain_type === 'unknown' ? '#f59e0b' : '#ef4444'
                    }}>
                      {result.domain_type.charAt(0).toUpperCase() + result.domain_type.slice(1)}
                    </span>
                  </div>
                )}
                
                {result.mx_valid !== undefined && (
                  <div className="detail-row">
                    <span className="detail-label">
                      <i className="fas fa-server"></i> Service:
                    </span>
                    <span className="detail-value" style={{
                      color: result.mx_valid ? '#10b981' : '#f59e0b'
                    }}>
                      <i className={result.mx_valid ? 'fas fa-check' : 'fas fa-exclamation-triangle'}></i>
                      {result.mx_valid ? ' Properly Configured' : ' Needs Configuration'}
                    </span>
                  </div>
                )}
              </div>
              
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="recommendations-section">
                  <h4 className="recommendations-title">
                    <i className="fas fa-lightbulb"></i> Recommendations
                  </h4>
                  <div className="recommendations-list">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="recommendation-item">
                        <i className="fas fa-chevron-right"></i>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!result.is_phishing && result.valid && (
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary"
                    onClick={navigateToSecurity}
                  >
                    <i className="fas fa-chart-line"></i>
                    <span>View Detailed Security Analysis</span>
                  </button>
                </div>
              )}
            </div>

            {similarEmails.length > 0 && (
              <div className="similar-emails-section">
                <h4 className="similar-title">
                  <i className="fas fa-users"></i> Similar Email Addresses
                </h4>
                <div className="similar-emails-list">
                  {similarEmails.map((email, index) => (
                    <div key={index} className="similar-email-item">
                      <i className="fas fa-envelope"></i>
                      <span className="similar-email">{email.email}</span>
                      <span className="similar-domain">({email.domain})</span>
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

export default EmailValidator;