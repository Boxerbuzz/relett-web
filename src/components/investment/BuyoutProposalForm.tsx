'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DollarSign, Users, Clock } from 'phosphor-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const buyoutProposalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  buyoutPrice: z.string().min(1, 'Buyout price is required'),
  minBuyoutPercentage: z.string().default('75'),
  buyoutDeadline: z.date({
    required_error: 'A deadline is required',
  }),
  justification: z.string().min(20, 'Please provide detailed justification'),
});

type BuyoutProposalFormData = z.infer<typeof buyoutProposalSchema>;

interface BuyoutProposalFormProps {
  investmentGroupId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BuyoutProposalForm({ 
  investmentGroupId, 
  onSuccess, 
  onCancel 
}: BuyoutProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BuyoutProposalFormData>({
    resolver: zodResolver(buyoutProposalSchema),
    defaultValues: {
      title: '',
      description: '',
      buyoutPrice: '',
      minBuyoutPercentage: '75',
      justification: '',
    },
  });

  const onSubmit = async (data: BuyoutProposalFormData) => {
    setIsSubmitting(true);
    try {
      // Create buyout proposal poll
      const response = await fetch('https://wossuijahchhtjzphsgh.supabase.co/functions/v1/create-investment-poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}`
        },
        body: JSON.stringify({
          investmentGroupId,
          pollType: 'buyout_proposal',
          title: data.title,
          description: data.description,
          buyoutPrice: parseFloat(data.buyoutPrice),
          minBuyoutPercentage: parseFloat(data.minBuyoutPercentage),
          buyoutDeadline: data.buyoutDeadline.toISOString(),
          votingPowerBasis: 'tokens',
          requiresConsensus: true,
          consensusThreshold: parseFloat(data.minBuyoutPercentage),
          autoExecuteOnSuccess: true,
          metadata: {
            justification: data.justification,
            proposalType: 'buyout_proposal'
          }
        })
      });

      if (response.ok) {
        toast({
          title: 'Buyout Proposal Created',
          description: 'Your buyout proposal has been submitted for voting.',
        });
        onSuccess();
      } else {
        throw new Error('Failed to create buyout proposal');
      }
    } catch (error) {
      console.error('Error creating buyout proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create buyout proposal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Create Buyout Proposal
        </CardTitle>
        <CardDescription>
          Propose a buyout of this tokenized property. All token holders will vote on this proposal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Buyout Proposal: Property Exit Strategy" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the buyout proposal and its benefits..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyoutPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyout Price (USD)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1000000" 
                        step="0.01"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Total price for the entire property
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minBuyoutPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Required Approval (%)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="75" 
                        min="51"
                        max="100"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum percentage of token holders who must approve
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="buyoutDeadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Voting Deadline
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When should the voting period end?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why this buyout is beneficial for all token holders..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed reasoning for the buyout proposal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Proposal...' : 'Create Proposal'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}