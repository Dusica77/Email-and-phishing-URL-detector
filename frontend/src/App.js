import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PhishingDetector from './components/PhishingDetector';
import EmailValidator from './components/EmailValidator';
import SecurityScore from './components/SecurityScore';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'phishing':
        return <PhishingDetector onNavigate={setCurrentPage} />;
      case 'validator':
        return <EmailValidator onNavigate={setCurrentPage} />;
      case 'security':
        return <SecurityScore onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;