
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceCategory } from './ServiceCategories';
import { ChevronRight } from 'lucide-react';

interface ServiceCategoryCardProps {
  category: ServiceCategory;
}

export function ServiceCategoryCard({ category }: ServiceCategoryCardProps) {
  const Icon = category.icon;

  const handleClick = () => {
    // TODO: Navigate to category providers page
    console.log(`Navigate to ${category.id} providers`);
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border border-gray-200"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {category.name}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {category.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Badge variant="secondary" className="text-xs">
              {category.providerCount} providers
            </Badge>
            <span className="text-xs text-gray-500">
              Verified professionals
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
