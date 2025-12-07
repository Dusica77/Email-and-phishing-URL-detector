import React from 'react';

const Navbar = ({ currentPage, onNavigate }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-icon">
          <i className="fas fa-shield-alt"></i>
        </div>
        <h1>Atria Validator</h1>
      </div>
      <div className="nav-links">
        <button 
          className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          <i className="fas fa-home"></i>
          <span>Home</span>
        </button>
        <button 
          className={`nav-link ${currentPage === 'phishing' ? 'active' : ''}`}
          onClick={() => onNavigate('phishing')}
        >
          <i className="fas fa-fish"></i>
          <span>Phishing</span>
        </button>
        <button 
          className={`nav-link ${currentPage === 'validator' ? 'active' : ''}`}
          onClick={() => onNavigate('validator')}
        >
          <i className="fas fa-envelope"></i>
          <span>Validator</span>
        </button>
        <button 
          className={`nav-link ${currentPage === 'security' ? 'active' : ''}`}
          onClick={() => onNavigate('security')}
        >
          <i className="fas fa-chart-line"></i>
          <span>Security</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;