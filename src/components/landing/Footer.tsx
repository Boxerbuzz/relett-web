
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const services = [
  { name: 'Relett Artisans', href: '/services/artisans' },
  { name: 'Relett Rentals', href: '/services/rentals' },
  { name: 'Relett Moove', href: '/services/moove' },
  { name: 'Relett Shortlet', href: '/services/shortlet' },
  { name: 'Relett Investments', href: '/services/investments' },
  { name: 'Relett Manager', href: '/services/manager' },
  { name: 'Relett Verify', href: '/services/verify' },
  { name: 'Relett Co-Spaces', href: '/services/co-spaces' }
];

const legalPages = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms & Conditions', href: '/terms' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Cookie Policy', href: '/cookies' },
  { name: 'Security & Certifications', href: '/security' }
];

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/relett', icon: Facebook },
  { name: 'Twitter', href: 'https://twitter.com/relett', icon: Twitter },
  { name: 'Instagram', href: 'https://instagram.com/relett', icon: Instagram },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/relett', icon: Linkedin },
  { name: 'YouTube', href: 'https://youtube.com/@relett', icon: Youtube }
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Relett</h3>
            <p className="text-gray-400 mb-6">
              Revolutionizing real estate through blockchain technology and innovative solutions. 
              Secure, transparent, and decentralized land records for everyone.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    to={social.href}
                    className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name}>
                  <Link to={service.href} className="text-gray-400 hover:text-white transition-colors">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalPages.map((page) => (
                <li key={page.name}>
                  <Link to={page.href} className="text-gray-400 hover:text-white transition-colors">
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">App Downloads</h4>
            <div className="space-y-3 mb-6">
              <Link
                to="https://apps.apple.com/ng/app/relett/id6736880954"
                target="_blank"
                className="block"
              >
                <img 
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                  alt="Download on App Store" 
                  className="h-12"
                />
              </Link>
              <Link to="#" className="block">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play" 
                  className="h-12"
                />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
              &copy; 2024 Relett. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Blockchain Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Bank-Grade Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
