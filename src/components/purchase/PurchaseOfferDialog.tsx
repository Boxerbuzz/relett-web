'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

const offerSchema = z.object({
  offer_amount: z.number().min(1, 'Offer amount must be greater than 0'),
  message: z.string().optional(),
  financing_type: z.enum(['cash', 'mortgage', 'mixed']),
  deposit_amount: z.number().min(0, 'Deposit amount must be valid'),
  closing_date: z.string().min(1, 'Closing date is required')
});

type OfferForm = z.infer<typeof offerSchema>;

interface PurchaseOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    asking_price: number;
  };
}

export function PurchaseOfferDialog({ isOpen, onClose, property }: PurchaseOfferDialogProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { handleDataError } = useErrorHandler();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<OfferForm>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      offer_amount: property.asking_price,
      financing_type: 'cash',
      deposit_amount: property.asking_price * 0.1 // 10% default
    }
  });

  const offerAmount = watch('offer_amount');
  const financingType = watch('financing_type');

  const onSubmit = async (data: OfferForm) => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('purchase_offers')
        .insert({
          property_id: property.id,
          buyer_id: user.id,
          offer_amount: data.offer_amount,
          message: data.message,
          financing_type: data.financing_type,
          deposit_amount: data.deposit_amount,
          closing_date: data.closing_date,
          status: 'pending'
        });

      if (error) throw error;

      // Create notification for property owner
      await supabase
        .from('notifications')
        .insert({
          user_id: property.id, // This should be the property owner's ID
          title: 'New Purchase Offer',
          message: `You received a purchase offer of $${data.offer_amount.toLocaleString()} for ${property.title}`,
          type: 'offer_received'
        });

      toast({
        title: "Offer submitted successfully!",
        description: "The property owner will be notified of your offer."
      });

      reset();
      onClose();
    } catch (error) {
      handleDataError(error, 'submit purchase offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Make Purchase Offer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="offer_amount">Offer Amount ($)</Label>
            <Input
              id="offer_amount"
              type="number"
              step="1000"
              {...register('offer_amount', { valueAsNumber: true })}
              className={errors.offer_amount ? 'border-red-500' : ''}
            />
            {errors.offer_amount && (
              <p className="text-sm text-red-600 mt-1">{errors.offer_amount.message}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Asking price: ${property.asking_price.toLocaleString()}
            </p>
          </div>

          <div>
            <Label htmlFor="financing_type">Financing Type</Label>
            <select
              id="financing_type"
              {...register('financing_type')}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="cash">Cash Purchase</option>
              <option value="mortgage">Mortgage Financing</option>
              <option value="mixed">Mixed Financing</option>
            </select>
          </div>

          <div>
            <Label htmlFor="deposit_amount">Deposit Amount ($)</Label>
            <Input
              id="deposit_amount"
              type="number"
              step="1000"
              {...register('deposit_amount', { valueAsNumber: true })}
              className={errors.deposit_amount ? 'border-red-500' : ''}
            />
            {errors.deposit_amount && (
              <p className="text-sm text-red-600 mt-1">{errors.deposit_amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="closing_date">Preferred Closing Date</Label>
            <Input
              id="closing_date"
              type="date"
              {...register('closing_date')}
              className={errors.closing_date ? 'border-red-500' : ''}
            />
            {errors.closing_date && (
              <p className="text-sm text-red-600 mt-1">{errors.closing_date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Any additional details or terms you'd like to include..."
              {...register('message')}
              rows={3}
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium mb-2">Offer Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Offer Amount:</span>
                <span className="font-medium">${offerAmount?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Financing:</span>
                <span className="capitalize">{financingType}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Offer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}