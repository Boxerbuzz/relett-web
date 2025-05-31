
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield } from 'lucide-react';

const services = [
  { name: 'Relett Artisans', href: '/services/artisans' },
  { name: 'Relett Rentals', href: '/services/rentals' },
  { name: 'Relett Moove', href: '/services/moove' },
  { name: 'Relett Shortlet', href: '/services/shortlet' }
];

const legalPages = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms & Conditions', href: '/terms' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Cookie Policy', href: '/cookies' },
  { name: 'Security & Certifications', href: '/security' }
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">Relett</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Revolutionizing real estate through blockchain technology and innovative solutions. 
              Secure, transparent, and decentralized land records for everyone.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Follow Us
              </Button>
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
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
              &copy; 2024 Relett. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-400 text-sm">Blockchain Verified</span>
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Bank-Grade Security</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
