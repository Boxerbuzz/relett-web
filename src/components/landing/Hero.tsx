
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Badge className="mb-4 sm:mb-6 bg-gray-100 text-black border border-gray-200 font-light rounded-full">
          🚀 Now Live: Blockchain-Powered Land Registry
        </Badge>
        
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

        {/* Trust Indicators */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-gray-600 mb-6 font-light">Join thousands of satisfied users across Africa</p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 opacity-60">
            <div className="text-gray-400 font-semibold">🇬🇭 Ghana Land Commission</div>
            <div className="text-gray-400 font-semibold">🇳🇬 Lagos State Govt</div>
            <div className="text-gray-400 font-semibold">🇰🇪 Kenya Land Registry</div>
            <div className="text-gray-400 font-semibold">🇿🇦 SA Property Board</div>
          </div>
        </div>
      </div>
    </section>
  );
}
