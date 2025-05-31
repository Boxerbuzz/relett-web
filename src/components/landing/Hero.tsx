
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
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
  );
}
