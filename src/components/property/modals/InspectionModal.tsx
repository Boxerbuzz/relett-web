import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from '@/components/ui/responsive-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  mode: z.string().min(1, 'Inspection mode is required'),
  when: z.string().min(1, 'Preferred date/time is required'),
  notes: z.string().optional(),
});

interface InspectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
}

export function InspectionModal({ open, onOpenChange, property }: InspectionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: '',
      when: '',
      notes: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to request an inspection',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('inspections')
        .insert({
          user_id: user.id,
          property_id: property.id,
          agent_id: property.user_id,
          mode: values.mode,
          when: values.when,
          notes: values.notes,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Inspection Requested',
        description: 'Your inspection request has been sent to the property agent'
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting inspection request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit inspection request',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent size="md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Request Inspection</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Schedule an inspection for {property?.title}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="px-4 md:px-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspection Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inspection type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="physical">Physical Inspection</SelectItem>
                        <SelectItem value="virtual">Virtual Tour</SelectItem>
                        <SelectItem value="video_call">Video Call</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="when"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific areas you'd like to focus on or special requirements..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton disabled={loading} />
          <Button type="submit" disabled={loading} onClick={form.handleSubmit(onSubmit)}>
            {loading ? 'Submitting...' : 'Request Inspection'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
