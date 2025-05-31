
'use client';

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, ArrowLeft } from 'lucide-react';

export default function Moove() {
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
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Relett Moove</h1>
              <p className="text-xl text-gray-600">Professional moving and relocation services</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Relett Moove will provide reliable logistics and moving services on demand. 
              Schedule moves, transport large items, or relocate hassle-free with trusted professionals.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Get Notified When Available
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
