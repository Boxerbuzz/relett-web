
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-green-600" />
            Plant a Tree, Save the Planet
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 h-full">
          {/* Tree Selection */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4">Choose a Tree to Plant</h3>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
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
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={tree.image_url}
                          alt={tree.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{tree.name}</h4>
                              {tree.scientific_name && (
                                <p className="text-sm text-gray-600 italic">
                                  {tree.scientific_name}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              {formatPrice(tree.price_ngn)}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">
                            {tree.description}
                          </p>

                          <div className="flex flex-wrap gap-3 text-xs">
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-3 h-3" />
                              {tree.location}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Leaf className="w-3 h-3" />
                              {tree.carbon_offset_kg}kg CO₂/year
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-3 h-3" />
                              {tree.growth_time_years} years to mature
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Donation Details */}
          {selectedTree && (
            <div className="w-full md:w-80">
              <Card className="sticky top-0">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Donation Summary</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={selectedTree.image_url}
                        alt={selectedTree.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium">{selectedTree.name}</h4>
                        <p className="text-sm text-gray-600">{selectedTree.location}</p>
                      </div>
                    </div>
                  </div>

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

                  <div className="space-y-3 py-4 border-t">
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

                  <div className="space-y-2">
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
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
