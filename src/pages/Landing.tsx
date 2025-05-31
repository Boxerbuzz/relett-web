
'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Building, 
  Truck, 
  Calendar, 
  DollarSign, 
  Settings, 
  Shield, 
  Users,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
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
    icon: Settings,
    href: '/services/artisans',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    name: 'Relett Rentals',
    description: 'Long-term property rental solutions',
    icon: Home,
    href: '/services/rentals',
    color: 'bg-green-50 text-green-600'
  },
  {
    name: 'Relett Moove',
    description: 'Professional moving and relocation services',
    icon: Truck,
    href: '/services/moove',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    name: 'Relett Shortlet',
    description: 'Short-term accommodation booking',
    icon: Calendar,
    href: '/services/shortlet',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    name: 'Relett Investments',
    description: 'Property investment and tokenization',
    icon: DollarSign,
    href: '/services/investments',
    color: 'bg-yellow-50 text-yellow-600'
  },
  {
    name: 'Relett Manager',
    description: 'Property management solutions',
    icon: Building,
    href: '/services/manager',
    color: 'bg-red-50 text-red-600'
  },
  {
    name: 'Relett Verify',
    description: 'Property verification and documentation',
    icon: Shield,
    href: '/services/verify',
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    name: 'Relett Co-Spaces',
    description: 'Shared workspace solutions',
    icon: Users,
    href: '/services/co-spaces',
    color: 'bg-teal-50 text-teal-600'
  }
];

const legalPages = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms & Conditions', href: '/terms' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Cookie Policy', href: '/cookies' },
  { name: 'Security & Certifications', href: '/security' }
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[800px] p-6">
                        <div className="grid grid-cols-2 gap-4">
                          {services.map((service) => {
                            const Icon = service.icon;
                            return (
                              <NavigationMenuLink key={service.name} asChild>
                                <Link
                                  to={service.href}
                                  className="group block p-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-lg ${service.color}`}>
                                      <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                                        {service.name}
                                      </h4>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {service.description}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            );
                          })}
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

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            The Future of
            <span className="text-blue-600 block">Real Estate</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Revolutionizing property ownership through blockchain technology. 
            Secure, transparent, and decentralized land records for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Start Your Journey
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive real estate solutions powered by cutting-edge technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.name} className="hover:shadow-lg transition-shadow border border-gray-200">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {service.description}
                    </p>
                    <Link to={service.href}>
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0">
                        Learn More →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">Relett</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Revolutionizing real estate through blockchain technology and innovative solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                {services.slice(0, 4).map((service) => (
                  <li key={service.name}>
                    <Link to={service.href} className="text-gray-400 hover:text-white">
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
                    <Link to={page.href} className="text-gray-400 hover:text-white">
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Relett. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
