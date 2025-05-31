
'use client';

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

export default function Rentals() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mr-4">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Relett Rentals</h1>
              <p className="text-xl text-gray-600">Long-term property rental solutions</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Relett Rentals will provide a comprehensive platform for long-term property 
              rentals with smart contracts, automated payments, and verified tenant screening.
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              Get Notified When Available
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
