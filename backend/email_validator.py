import re
import dns.resolver
import socket
import json
import os
from datetime import datetime

class EmailValidator:
    def __init__(self):
        # Valid domains
        self.valid_domains = {
            'gmail.com', 'yahoo.com', 'icloud.com', 'outlook.com', 
            'hotmail.com', 'atria.edu.com', 'company.com',
            'protonmail.com', 'aol.com', 'zoho.com', 'mail.com',
            'live.com', 'msn.com', 'rediffmail.com', 'ymail.com'
        }
        
        # Phishing domains - EXACT matches
        self.phishing_domains = [
            'gmail-security-verify.com', 
            'apple-support-update.com',
            'microsoft-account-confirm.net', 
            'paypal-security-login.org',
            'amazon-verification-service.com',
            'facebook-security-alert.com'
        ]
        
        # Disposable domains
        self.disposable_domains = [
            'tempmail.com', '10minutemail.com', 'mailinator.com',
            'yopmail.com', 'throwawaymail.com'
        ]

    def validate_email_format(self, email: str):
        """Validate basic email format"""
        if not email or '@' not in email:
            return False, "Invalid email format - missing @ symbol"
        
        # Enhanced regex for email validation
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not re.match(pattern, email):
            return False, "Invalid email format - incorrect structure"
        
        return True, "Valid email format"

    def check_domain(self, domain: str):
        """Check domain type"""
        domain_lower = domain.lower()
        
        # Check exact phishing domain matches
        for phishing_domain in self.phishing_domains:
            if domain_lower == phishing_domain:
                return False, "Phishing domain detected", "phishing"
        
        # Check disposable domains
        if any(disposable == domain_lower for disposable in self.disposable_domains):
            return False, "Disposable email domain", "disposable"
        
        # Check valid domains
        if domain_lower in self.valid_domains:
            return True, "Valid domain", "trusted"
        
        return True, "Unknown domain", "unknown"

    def check_mx_records(self, domain: str):
        """Check MX records with better error handling"""
        try:
            # Set timeout to avoid long waits
            dns.resolver.default_resolver = dns.resolver.Resolver()
            dns.resolver.default_resolver.timeout = 3
            dns.resolver.default_resolver.lifetime = 3
            
            answers = dns.resolver.resolve(domain, 'MX')
            if len(answers) > 0:
                return True, "MX records found - email service active"
            else:
                return False, "No MX records found"
        except dns.resolver.NXDOMAIN:
            return False, "Domain does not exist"
        except dns.resolver.NoAnswer:
            return False, "No MX records found for domain"
        except dns.resolver.Timeout:
            return False, "DNS query timeout"
        except Exception as e:
            return False, f"DNS lookup failed"

    def comprehensive_validate(self, email: str):
        """Comprehensive email validation"""
        try:
            print(f"🔍 Validating email: {email}")
            
            # Format validation
            format_valid, format_msg = self.validate_email_format(email)
            if not format_valid:
                return {
                    'valid': False,
                    'message': format_msg,
                    'score': 0,
                    'is_phishing': False,
                    'recommendations': ['Please enter a valid email address format']
                }
            
            parts = email.split('@')
            if len(parts) != 2:
                return {
                    'valid': False,
                    'message': 'Invalid email format',
                    'score': 0,
                    'is_phishing': False
                }
                
            local_part = parts[0]
            domain = parts[1]
            
            print(f"📧 Local: {local_part}, Domain: {domain}")
            
            # Domain validation
            domain_valid, domain_msg, domain_type = self.check_domain(domain)
            print(f"🏷️ Domain check: {domain_msg}, Type: {domain_type}")
            
            # Check for phishing
            is_phishing = domain_type == "phishing"
            
            if is_phishing:
                return {
                    'valid': False,
                    'message': '🚨 PHISHING EMAIL DETECTED',
                    'score': 0,
                    'is_phishing': True,
                    'domain': domain,
                    'domain_type': domain_type,
                    'recommendations': [
                        'This email appears to be a phishing attempt',
                        'Do not provide any personal information',
                        'Report this email to your security team',
                        'Delete this email immediately'
                    ]
                }
            
            # MX records check
            mx_valid, mx_msg = self.check_mx_records(domain)
            print(f"📨 MX Check: {mx_msg}, Valid: {mx_valid}")
            
            # Calculate score
            score = self.calculate_security_score(local_part, domain_type, mx_valid)
            print(f"🎯 Security Score: {score}")
            
            # Recommendations
            recommendations = self.generate_recommendations(score, domain_type, mx_valid, local_part)
            
            # Build final message
            if domain_valid and not is_phishing:
                if mx_valid:
                    final_message = f"✅ {domain_msg}. {mx_msg}"
                else:
                    final_message = f"⚠️ {domain_msg}. {mx_msg}"
            else:
                final_message = f"❌ {domain_msg}"
            
            return {
                'valid': domain_valid and not is_phishing,
                'message': final_message,
                'score': score,
                'is_phishing': is_phishing,
                'domain': domain,
                'domain_type': domain_type,
                'mx_valid': mx_valid,
                'recommendations': recommendations
            }
            
        except Exception as e:
            print(f"❌ Validation error: {str(e)}")
            return {
                'valid': False,
                'message': f'Validation error',
                'score': 0,
                'is_phishing': False,
                'recommendations': ['Error during validation process']
            }

    def calculate_security_score(self, local_part: str, domain_type: str, mx_valid: bool):
        """Calculate security score"""
        score = 50  # Base score
        
        # Local part complexity
        if len(local_part) >= 8:
            score += 10
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', local_part):
            score += 10
        if re.search(r'\d', local_part):
            score += 5
        
        # Domain trust
        if domain_type == 'trusted':
            score += 25
        elif domain_type == 'unknown':
            score += 10
        
        # MX records
        if mx_valid:
            score += 15
        
        return min(score, 100)

    def generate_recommendations(self, score: int, domain_type: str, mx_valid: bool, local_part: str):
        """Generate recommendations"""
        recommendations = []
        
        if score < 60:
            recommendations.append("Consider using a more secure email provider")
        
        if len(local_part) < 8:
            recommendations.append("Use a longer username for better security")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', local_part):
            recommendations.append("Include special characters in your email username")
        
        if domain_type == 'unknown':
            recommendations.append("Consider using established email providers like Gmail or Outlook")
        
        if not mx_valid:
            recommendations.append("Email service configuration may need improvement")
        
        if score >= 80:
            recommendations.append("Your email security is excellent")
        elif score >= 60:
            recommendations.append("Your email security is good")
        else:
            recommendations.append("Your email security needs improvement")
        
        return recommendations

    def find_similar_emails(self, email: str):
        """Find similar emails"""
        try:
            if '@' not in email:
                return []
                
            domain = email.split('@')[1]
            
            # Load existing emails
            try:
                with open('data/email_analyses.json', 'r') as f:
                    analyses = json.load(f)
            except:
                analyses = []
            
            # Find similar emails (same domain)
            similar = []
            for analysis in analyses:
                analysis_email = analysis.get('email', '')
                if analysis_email != email and analysis_email.endswith('@' + domain):
                    similar.append({
                        'email': analysis_email,
                        'domain': domain
                    })
                if len(similar) >= 3:
                    break
            
            return similar
        except Exception as e:
            print(f"Error finding similar emails: {e}")
            return []

# Global instance
email_validator = EmailValidator()

def validate_email(email: str):
    return email_validator.comprehensive_validate(email)

def find_similar_emails(email: str):
    return email_validator.find_similar_emails(email)