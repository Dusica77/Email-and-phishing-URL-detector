from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Import our validators
from email_validator import validate_email, find_similar_emails
from phishing_detector import detect_phishing_url

# Simple file-based storage
def load_data(filename):
    """Load data from JSON file"""
    try:
        with open(f'data/{filename}.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_data(filename, data):
    """Save data to JSON file"""
    os.makedirs('data', exist_ok=True)
    with open(f'data/{filename}.json', 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/api/validate-email', methods=['POST'])
def validate_email_route():
    data = request.json
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({
            'valid': False,
            'message': 'No email provided',
            'score': 0,
            'is_phishing': False
        })
    
    # Validate email
    result = validate_email(email)
    
    # Find similar emails
    similar_emails = find_similar_emails(email)
    result['similar_emails'] = similar_emails
    
    # Store analysis
    analyses = load_data('email_analyses')
    analyses.append({
        'email': email,
        'result': result,
        'timestamp': datetime.now().isoformat()
    })
    save_data('email_analyses', analyses)
    
    return jsonify(result)

@app.route('/api/detect-phishing', methods=['POST'])
def detect_phishing_route():
    data = request.json
    url = data.get('url', '').strip()
    
    if not url:
        return jsonify({
            'is_phishing': False,
            'risk_score': 0,
            'warnings': ['No URL provided'],
            'domain': 'unknown'
        })
    
    # Check known phishing URLs
    known_urls = load_data('phishing_urls')
    known_phishing = next((item for item in known_urls if item['url'] == url), None)
    
    if known_phishing:
        return jsonify({
            'is_phishing': True,
            'risk_score': 100,
            'warnings': ['Known phishing URL from database'],
            'domain': known_phishing.get('domain', 'unknown'),
            'source': 'database'
        })
    
    # Detect phishing
    result = detect_phishing_url(url)
    
    # Store if phishing detected
    if result['is_phishing'] or result['risk_score'] > 60:
        known_urls.append({
            'url': url,
            'domain': result['domain'],
            'risk_score': result['risk_score'],
            'timestamp': datetime.now().isoformat()
        })
        save_data('phishing_urls', known_urls)
    
    return jsonify(result)

@app.route('/api/security-score/<email>', methods=['GET'])
def get_security_score(email):
    """Get detailed security analysis for an email"""
    if not email:
        return jsonify({'error': 'Email required'}), 400
    
    result = validate_email(email)
    
    # Enhanced scoring
    enhanced_result = {
        **result,
        'detailed_analysis': {
            'format_score': 20 if result.get('valid', False) else 0,
            'domain_score': 25 if result.get('domain_type') == 'trusted' else 10,
            'mx_score': 15 if result.get('mx_valid', False) else 0,
            'phishing_protection_score': 30 if not result.get('is_phishing', True) else 0,
        },
        'improvement_suggestions': generate_improvement_suggestions(result)
    }
    
    return jsonify(enhanced_result)

@app.route('/api/similar-emails/<email>', methods=['GET'])
def get_similar_emails(email):
    """Get similar emails"""
    similar_emails = find_similar_emails(email)
    return jsonify({'similar_emails': similar_emails})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get statistics"""
    email_analyses = load_data('email_analyses')
    phishing_urls = load_data('phishing_urls')
    
    total_emails = len(email_analyses)
    total_urls = len(phishing_urls)
    phishing_emails = sum(1 for item in email_analyses if item.get('result', {}).get('is_phishing', False))
    
    return jsonify({
        'total_emails_analyzed': total_emails,
        'total_phishing_urls': total_urls,
        'phishing_emails_detected': phishing_emails
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'message': 'Attia Validator API is running'
    })

def generate_improvement_suggestions(result):
    """Generate improvement suggestions"""
    suggestions = []
    
    if result.get('score', 0) < 70:
        suggestions.append("Use a more complex email address with mixed characters")
    
    if result.get('domain_type') == 'unknown':
        suggestions.append("Consider using established email providers like Gmail or Outlook")
    
    if not result.get('mx_valid', False):
        suggestions.append("Ensure your domain has proper MX records configured")
    
    if result.get('score', 0) >= 80:
        suggestions.append("Your email security is excellent - maintain current practices")
    elif result.get('score', 0) >= 60:
        suggestions.append("Your email security is good")
    else:
        suggestions.append("Your email security needs improvement")
    
    return suggestions

if __name__ == '__main__':
    print("🚀 Starting Attia Validator Backend...")
    print("📊 Storage: JSON Files")
    app.run(debug=True, port=5000)