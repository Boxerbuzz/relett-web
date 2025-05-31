
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
  ChevronDown,
  Star,
  Quote,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

const quickLinks = [
  { name: 'Property Verification', href: '/verification' },
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'My Properties', href: '/land' },
  { name: 'Tokens', href: '/tokens' },
  { name: 'Map View', href: '/map' },
];

const legalPages = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms & Conditions', href: '/terms' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Cookie Policy', href: '/cookies' },
  { name: 'Security & Certifications', href: '/security' }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Property Developer',
    content: 'Relett has revolutionized how we manage our property portfolio. The blockchain verification gives us complete confidence in our transactions.',
    rating: 5,
    avatar: '/placeholder.svg'
  },
  {
    name: 'Michael Chen',
    role: 'Real Estate Investor',
    content: 'The tokenization feature allowed me to diversify my investments like never before. Truly innovative platform.',
    rating: 5,
    avatar: '/placeholder.svg'
  },
  {
    name: 'Amara Okafor',
    role: 'Property Owner',
    content: 'Finally, a transparent and secure way to manage property records. The verification process is seamless.',
    rating: 5,
    avatar: '/placeholder.svg'
  }
];

const faqs = [
  {
    question: 'What is blockchain-based property verification?',
    answer: 'Our blockchain-based verification creates immutable records of property ownership and transactions, ensuring complete transparency and eliminating fraud.'
  },
  {
    question: 'How does property tokenization work?',
    answer: 'Property tokenization allows you to convert real estate assets into digital tokens, enabling fractional ownership and easier investment opportunities.'
  },
  {
    question: 'Is my data secure on Relett?',
    answer: 'Yes, we use advanced encryption and blockchain technology to ensure your data is completely secure and tamper-proof.'
  },
  {
    question: 'Can I use Relett for commercial properties?',
    answer: 'Absolutely! Relett supports both residential and commercial property management, verification, and tokenization.'
  },
  {
    question: 'What are the fees for using Relett services?',
    answer: 'Our pricing is transparent and competitive. Contact our sales team for detailed pricing information based on your specific needs.'
  }
];

const sponsors = [
  { name: 'TechCorp', logo: '/placeholder.svg' },
  { name: 'InnovateNow', logo: '/placeholder.svg' },
  { name: 'BlockchainFund', logo: '/placeholder.svg' },
  { name: 'PropTech Ventures', logo: '/placeholder.svg' },
  { name: 'Future Finance', logo: '/placeholder.svg' }
];

const govBodies = [
  { name: 'Ministry of Housing', logo: '/placeholder.svg' },
  { name: 'Land Registry Authority', logo: '/placeholder.svg' },
  { name: 'Property Regulation Board', logo: '/placeholder.svg' },
  { name: 'Digital Innovation Agency', logo: '/placeholder.svg' }
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
                                          <h5 className="font-semibold text-gray-900 group-hover:text-blue-600">
                                            {service.name}
                                          </h5>
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

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Real Estate Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of property owners who trust Relett for secure, transparent, and efficient property management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              Get Started Today
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted by property owners, developers, and investors worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-blue-600 mb-4" />
                  <p className="text-gray-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                      <span className="text-gray-600 font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Relett
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Sponsored By Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sponsored By</h3>
            <p className="text-gray-600">Backed by leading technology and investment partners</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            {sponsors.map((sponsor, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="w-32 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
                  <span className="text-gray-600 font-semibold text-sm">{sponsor.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Bodies Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Recognized By Government Bodies</h3>
            <p className="text-gray-600">Certified and approved by regulatory authorities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
            {govBodies.map((body, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="w-40 h-20 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                  <span className="text-gray-700 font-medium text-sm text-center px-2">{body.name}</span>
                </div>
              </div>
            ))}
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
                {services.slice(0, 4).map((service) => (
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
    </div>
  );
}
