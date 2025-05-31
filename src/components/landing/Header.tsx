
'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const services = [
  {
    name: 'Relett Artisans',
    description: 'Connect with skilled craftsmen and contractors',
    href: '/services/artisans',
  },
  {
    name: 'Relett Rentals',
    description: 'Long-term property rental solutions',
    href: '/services/rentals',
  },
  {
    name: 'Relett Moove',
    description: 'Professional moving and relocation services',
    href: '/services/moove',
  },
  {
    name: 'Relett Shortlet',
    description: 'Short-term accommodation booking',
    href: '/services/shortlet',
  },
  {
    name: 'Relett Investments',
    description: 'Property investment and tokenization',
    href: '/services/investments',
  },
  {
    name: 'Relett Manager',
    description: 'Property management solutions',
    href: '/services/manager',
  },
  {
    name: 'Relett Verify',
    description: 'Property verification and documentation',
    href: '/services/verify',
  },
  {
    name: 'Relett Co-Spaces',
    description: 'Shared workspace solutions',
    href: '/services/co-spaces',
  }
];

const quickLinks = [
  { name: 'Property Verification', href: '/verification' },
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'My Properties', href: '/land' },
  { name: 'Tokens', href: '/tokens' },
  { name: 'Map View', href: '/map' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Relett
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[900px] p-6">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2">
                          <h4 className="font-semibold text-gray-900 mb-4">Our Services</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {services.map((service) => (
                              <NavigationMenuLink key={service.name} asChild>
                                <Link
                                  to={service.href}
                                  className="group block p-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div>
                                    <h5 className="font-semibold text-gray-900 group-hover:text-blue-600">
                                      {service.name}
                                    </h5>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {service.description}
                                    </p>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                        <div className="border-l border-gray-200 pl-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
                          <div className="space-y-2">
                            {quickLinks.map((link) => (
                              <NavigationMenuLink key={link.name} asChild>
                                <Link
                                  to={link.href}
                                  className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                                >
                                  {link.name}
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h5 className="font-semibold text-blue-900 mb-2">Get Started Today</h5>
                            <p className="text-sm text-blue-700 mb-3">Join thousands of property owners using Relett</p>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Start Free Trial
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-6 space-y-4">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
              {services.map((service) => (
                <Link
                  key={service.name}
                  to={service.href}
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {service.name}
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Link to="/" className="block w-full mb-3">
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link to="/" className="block w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
