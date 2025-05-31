
import { Badge } from '@/components/ui/badge';

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

export function Sponsors() {
  return (
    <>
      {/* Sponsored By Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 sm:mb-6 bg-gray-100 text-gray-600 border border-gray-200 font-light rounded-full">
              🤝 Our Partners
            </Badge>
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
            <Badge className="mb-4 sm:mb-6 bg-green-50 text-green-600 border border-green-200 font-light rounded-full">
              🏛️ Government Recognition
            </Badge>
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
    </>
  );
}
