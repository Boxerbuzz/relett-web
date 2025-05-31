
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Building, 
  Truck, 
  Calendar, 
  DollarSign, 
  Settings, 
  Shield, 
  Users
} from 'lucide-react';

const services = [
  {
    name: 'Relett Artisans',
    description: 'Easily find and hire vetted service professionals — plumbers, electricians, painters, cleaners, and more — anytime, anywhere.',
    icon: Settings,
    href: '/services/artisans',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    name: 'Relett Rentals',
    description: 'Find long-term rental properties with ease. Verified listings, transparent pricing, and fast, secure processes designed just for you.',
    icon: Home,
    href: '/services/rentals',
    color: 'bg-green-50 text-green-600'
  },
  {
    name: 'Relett Moove',
    description: 'Reliable logistics and moving services on demand. Schedule moves, transport large items, or relocate hassle-free with trusted professionals.',
    icon: Truck,
    href: '/services/moove',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    name: 'Relett Shortlet',
    description: 'Book short-stay, furnished apartments perfect for travelers, remote workers, and weekend getaways. Flexible durations, instant booking.',
    icon: Calendar,
    href: '/services/shortlet',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    name: 'Relett Investments',
    description: 'Invest in real estate with as little as ₦50,000. Participate in fractional property ownership, earn rental income, and build wealth.',
    icon: DollarSign,
    href: '/services/investments',
    color: 'bg-yellow-50 text-yellow-600'
  },
  {
    name: 'Relett Manager',
    description: 'Smart tools for property owners and managers — automate rent collection, manage inspections, chat with tenants, and track property.',
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
    description: 'Discover co-living and co-working spaces that foster community and productivity. Ideal for young creatives and professionals.',
    icon: Users,
    href: '/services/co-spaces',
    color: 'bg-teal-50 text-teal-600'
  }
];

export function Services() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 sm:mb-6 bg-green-50 text-green-600 border border-green-200 font-light rounded-full">
            🛠️ Our Services
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our unique services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're renting, managing, moving, or investing — Relett offers all-in-one services designed to make your real estate experience seamless, fast, and trustworthy.
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
  );
}
