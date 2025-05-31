
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardBody } from '@/components/ui/card';
import { ArrowRight, CornerUpRight } from 'lucide-react';

const avatars = [
  "https://api.dicebear.com/9.x/adventurer-neutral/png?seed=user1&hair=bangs,buns,flatTop,fluffy,longCurls,parting,plain,roundBob,shortCurls,spiky,wavy&mood=happy,neutral,superHappy",
  "https://api.dicebear.com/9.x/adventurer-neutral/png?seed=user2&hair=bangs,buns,flatTop,fluffy,longCurls,parting,plain,roundBob,shortCurls,spiky,wavy&mood=happy,neutral,superHappy",
  "https://api.dicebear.com/9.x/adventurer-neutral/png?seed=user3&hair=bangs,buns,flatTop,fluffy,longCurls,parting,plain,roundBob,shortCurls,spiky,wavy&mood=happy,neutral,superHappy",
  "https://api.dicebear.com/9.x/adventurer-neutral/png?seed=user4&hair=bangs,buns,flatTop,fluffy,longCurls,parting,plain,roundBob,shortCurls,spiky,wavy&mood=happy,neutral,superHappy"
];

export function Hero() {
  return (
    <section className="pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          <div className="lg:col-span-7">
            <Card className="bg-gradient-to-br from-blue-50 to-white overflow-hidden p-0 h-full relative">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-20">
                <svg
                  className="fill-blue-600"
                  width="220px"
                  height="209px"
                  viewBox="0 0 220 209"
                >
                  <path d="M84.3,120.6c-1.1-0.3-1.9-0.8-2.4-1.6c-1-1.4-0.7-3.3,0.8-5.2l15.9-21.1c2.2-2.9,6.5-5.3,10.6-5.8 c2.3-0.3,4.2,0,5.4,1l14.9,11.6c1,0.8,1.4,1.9,1.2,3.2c-0.6,3.1-4.6,6.5-9.3,8l-30.9,9.5C88.2,121,85.9,121.1,84.3,120.6z" />
                </svg>
              </div>

              <CardContent className="relative p-6 lg:p-12 text-center">
                <Badge className="mb-6 bg-white text-blue-600 border border-blue-200 font-light rounded-full inline-flex items-center px-4 py-2">
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 mr-2">
                    Smart
                  </span>
                  4x faster ⚡️
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Rent Smarter,
                  <span className="text-blue-600 block">Live Better</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Discover, inspect, and secure long-term homes with speed and confidence — no agents, no delays, just smarter renting.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Link to="#steps">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                      Learn More
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="px-8 py-3">
                    Get started
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <CornerUpRight className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">4.9</span>
                  <div className="flex -space-x-2">
                    {avatars.map((avatar, idx) => (
                      <img
                        key={idx}
                        className="w-10 h-10 border-2 border-blue-600 rounded-full"
                        src={avatar}
                        alt="avatar"
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">5K+</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="bg-gray-900 text-white overflow-hidden p-6 lg:p-8 h-full">
              <CardContent className="relative">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-6">Why Choose Relett Rentals?</h2>
                <p className="text-gray-300 mb-6">
                  Finding a rental property in Africa's major cities can be challenging, time-consuming, and filled with uncertainty. Relett Rentals changes that by providing a curated selection of verified properties, transparent pricing, and a technology-driven process that prioritizes your needs.
                </p>
                <p className="text-gray-300">
                  Our platform connects you with landlords and property managers who meet our strict quality and service standards. We've streamlined the entire rental process from search to move-in, making it 4x faster than traditional methods.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8 font-light text-lg">Join thousands of satisfied users across Africa</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-gray-400 font-semibold text-lg">🇬🇭 Ghana Land Commission</div>
            <div className="text-gray-400 font-semibold text-lg">🇳🇬 Lagos State Govt</div>
            <div className="text-gray-400 font-semibold text-lg">🇰🇪 Kenya Land Registry</div>
            <div className="text-gray-400 font-semibold text-lg">🇿🇦 SA Property Board</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
