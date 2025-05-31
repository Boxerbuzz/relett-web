
'use client';

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowLeft } from 'lucide-react';

export default function CoSpaces() {
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
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Relett Co-Spaces</h1>
              <p className="text-xl text-gray-600">Shared workspace solutions</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Relett Co-Spaces will help you discover co-living and co-working spaces that foster 
              community and productivity. Ideal for young creatives and professionals.
            </p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              Get Notified When Available
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
