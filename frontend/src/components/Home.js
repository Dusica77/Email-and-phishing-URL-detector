import React from 'react';

const Home = ({ onNavigate }) => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Secure Email Validation</h1>
        <p className="hero-subtitle">
          Advanced security platform for email validation and phishing detection. 
          Protect your institution with real-time threat analysis.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <i className="stat-icon fas fa-bullseye"></i>
          <span className="stat-number">100%</span>
          <div className="stat-label">Accuracy</div>
        </div>
        <div className="stat-card">
          <i className="stat-icon fas fa-users"></i>
          <span className="stat-number">200+</span>
          <div className="stat-label">Protected</div>
        </div>
        <div className="stat-card">
          <i className="stat-icon fas fa-bolt"></i>
          <span className="stat-number">Real-time</span>
          <div className="stat-label">Analysis</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-icon">
            <i className="fas fa-fish"></i>
          </div>
          <h3>URL Detection</h3>
          <p>Identify and analyze potential phishing URLs with advanced pattern recognition.</p>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('phishing')}
          >
            <i className="fas fa-arrow-right"></i>
            <span>Analyze URLs</span>
          </button>
        </div>

        <div className="card">
          <div className="card-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <h3>Email Validation</h3>
          <p>Comprehensive email verification with domain authentication and security scoring.</p>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('validator')}
          >
            <i className="fas fa-arrow-right"></i>
            <span>Validate Emails</span>
          </button>
        </div>

        <div className="card">
          <div className="card-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h3>Security Insights</h3>
          <p>Detailed security analysis and recommendations for enhanced protection.</p>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('security')}
          >
            <i className="fas fa-arrow-right"></i>
            <span>View Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;