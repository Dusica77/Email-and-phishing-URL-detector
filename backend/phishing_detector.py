import re
from urllib.parse import urlparse
from datetime import datetime

class PhishingDetector:
    def __init__(self):
        # Known phishing domains - EXACT matches
        self.known_phishing_domains = [
            'gmail-security-verify.com', 
            'apple-support-update.com',
            'microsoft-account-confirm.net', 
            'paypal-security-login.org',
            'amazon-verification-service.com',
            'facebook-security-alert.com',
            'login-verify-security.com', 
            'account-confirmation-update.com'
        ]
        
        # Suspicious TLDs
        self.suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.loan']
        
        # Legitimate domains for typosquatting detection
        self.legit_domains = ['google', 'facebook', 'amazon', 'microsoft', 'apple', 'paypal']

    def detect_phishing_url(self, url):
        """Detect phishing URLs"""
        print(f"🔍 Analyzing URL: {url}")
        
        if not url:
            return self._create_response(False, 0, ['No URL provided'], 'unknown')

        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()

            print(f"🌐 Domain: {domain}, Path: {path}")

            risk_score = 0
            warnings = []

            # Check known phishing domains (EXACT match)
            for phishing_domain in self.known_phishing_domains:
                if domain == phishing_domain:
                    risk_score += 80
                    warnings.append('Known phishing domain detected')
                    print(f"🚨 Known phishing domain: {phishing_domain}")
                    break

            # Check suspicious TLDs
            for tld in self.suspicious_tlds:
                if domain.endswith(tld):
                    risk_score += 30
                    warnings.append(f'Suspicious domain extension: {tld}')
                    print(f"⚠️ Suspicious TLD: {tld}")
                    break

            # Check for IP address in domain
            ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
            if re.search(ip_pattern, domain):
                risk_score += 40
                warnings.append('IP address used instead of domain name')
                print("🔢 IP address in domain")

            # Check for excessive subdomains
            subdomain_count = domain.count('.')
            if subdomain_count > 3:
                risk_score += 20
                warnings.append(f'Excessive subdomains ({subdomain_count})')
                print(f"🔗 Excessive subdomains: {subdomain_count}")

            # Check phishing keywords in domain and path
            phishing_keywords = ['login', 'verify', 'security', 'account', 'password', 'reset', 'confirm', 'update']
            keyword_count = 0
            
            for keyword in phishing_keywords:
                if keyword in domain or keyword in path:
                    keyword_count += 1
                    risk_score += 8  # Smaller increment per keyword

            if keyword_count >= 2:
                risk_score += 15  # Bonus for multiple keywords
                warnings.append(f'Multiple suspicious keywords detected ({keyword_count})')
                print(f"📝 Phishing keywords: {keyword_count}")

            # Check typosquatting
            for legit in self.legit_domains:
                if legit in domain and domain != f"{legit}.com":
                    # Check for common phishing variations
                    variations = [
                        f"{legit}-security", f"{legit}-verify", f"{legit}-login",
                        f"{legit}-account", f"{legit}-update", f"{legit}1", f"{legit}0"
                    ]
                    if any(var in domain for var in variations):
                        risk_score += 50
                        warnings.append(f'Typosquatting detected: mimicking {legit}')
                        print(f"🎭 Typosquatting: {legit}")
                        break

            # Check URL length (very short URLs might be masked)
            if len(url) < 20:
                risk_score += 10
                warnings.append('Very short URL - might be masked')
                print("📏 Short URL")

            print(f"🎯 Final risk score: {risk_score}")

            # Determine if phishing
            is_phishing = risk_score >= 60

            return self._create_response(is_phishing, risk_score, warnings, domain)

        except Exception as e:
            print(f"❌ URL analysis error: {e}")
            return self._create_response(False, 0, ['Error analyzing URL'], 'unknown')

    def _create_response(self, is_phishing, risk_score, warnings, domain):
        """Create response object"""
        return {
            'is_phishing': is_phishing,
            'risk_score': min(risk_score, 100),
            'warnings': warnings,
            'domain': domain,
            'timestamp': datetime.now().isoformat()
        }

# Global instance
phishing_detector = PhishingDetector()

def detect_phishing_url(url):
    return phishing_detector.detect_phishing_url(url)