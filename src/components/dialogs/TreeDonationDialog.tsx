
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, TreePine, MapPin, Clock, Leaf } from 'lucide-react';
import { useTreeDonation, Tree } from '@/hooks/useTreeDonation';

interface TreeDonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TreeDonationDialog({ open, onOpenChange }: TreeDonationDialogProps) {
  const { trees, createDonation, loading } = useTreeDonation();
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, value));
  };

  const handleDonate = async () => {
    if (selectedTree) {
      await createDonation(selectedTree.id, quantity);
      onOpenChange(false);
      setSelectedTree(null);
      setQuantity(1);
    }
  };

  const formatPrice = (priceInKobo: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(priceInKobo / 100);
  };

  const totalAmount = selectedTree ? selectedTree.price_ngn * quantity : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-green-600" />
            Plant a Tree, Save the Planet
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Left Side - Tree Selection */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-4">Choose a Tree to Plant</h3>
            
            {/* Tree Thumbnails Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {trees.map((tree) => (
                <Card
                  key={tree.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTree?.id === tree.id
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTree(tree)}
                >
                  <CardContent className="p-3">
                    <div className="relative mb-2">
                      <img
                        src={tree.image_url}
                        alt={tree.name}
                        className="w-full h-20 rounded-md object-cover"
                      />
                      <Badge 
                        variant="outline" 
                        className="absolute top-1 right-1 bg-white/90 text-green-700 border-green-300 text-xs"
                      >
                        {formatPrice(tree.price_ngn)}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm leading-tight truncate">
                      {tree.name}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {tree.location}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Tree Details */}
            {selectedTree && (
              <Card className="flex-shrink-0">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={selectedTree.image_url}
                      alt={selectedTree.name}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{selectedTree.name}</h4>
                      {selectedTree.scientific_name && (
                        <p className="text-sm text-gray-600 italic mb-2">
                          {selectedTree.scientific_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 mb-3">
                        {selectedTree.description}
                      </p>
                      
                      {/* Tree Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{selectedTree.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Leaf className="w-4 h-4" />
                          <span>{selectedTree.carbon_offset_kg}kg CO₂/year</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{selectedTree.growth_time_years} years to mature</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Payment Section */}
          <div className="w-80 flex-shrink-0">
            <Card className="h-full bg-gray-50">
              <CardContent className="p-6 h-full flex flex-col">
                {selectedTree ? (
                  <div className="space-y-6 flex-1">
                    {/* Donation Summary */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Donation Summary</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={selectedTree.image_url}
                          alt={selectedTree.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-medium">{selectedTree.name}</h4>
                          <p className="text-sm text-gray-600">{selectedTree.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selection */}
                    <div>
                      <Label htmlFor="quantity">Number of Trees</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          <Minus size={14} />
                        </Button>
                        <Input
                          id="quantity"
                          type="number"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                          className="text-center w-20"
                          min={1}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* Donation Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Trees:</span>
                        <span className="font-medium">{quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Price per tree:</span>
                        <span className="font-medium">{formatPrice(selectedTree.price_ngn)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>CO₂ absorption/year:</span>
                        <span className="font-medium text-green-600">
                          {selectedTree.carbon_offset_kg * quantity}kg
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total Donation:</span>
                        <span className="text-green-600">{formatPrice(totalAmount)}</span>
                      </div>
                    </div>

                    <div className="flex-1" />

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={handleDonate}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {loading ? 'Processing...' : `Donate ${formatPrice(totalAmount)}`}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                      Payment secured by Paystack. You will receive a certificate after successful payment.
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center py-8">
                    <TreePine className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Select a Tree to Plant</h3>
                    <p className="text-gray-600 mb-4">
                      Choose from our collection of native Nigerian trees to see pricing and donation details.
                    </p>
                    <div className="text-sm text-gray-500">
                      Starting from ₦2,000 per tree
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
