
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useNotificationDelivery } from './useNotificationDelivery';

export function usePollNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendNotification } = useNotificationDelivery();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new polls
    const pollsSubscription = supabase
      .channel('investment_polls_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'investment_polls'
      }, async (payload) => {
        console.log('New poll created:', payload);
        
        // Get the investment group details
        const { data: groupData } = await supabase
          .from('investment_groups')
          .select('name, lead_investor_id')
          .eq('id', payload.new.investment_group_id)
          .single();

        if (groupData && payload.new.created_by !== user.id) {
          toast({
            title: 'New Poll Created',
            description: `A new poll "${payload.new.title}" has been created in ${groupData.name}`,
          });

          // Send notification
          await sendNotification(
            user.id,
            'investment',
            'New Investment Poll',
            `A new poll "${payload.new.title}" has been created in ${groupData.name}`,
            {
              poll_id: payload.new.id,
              investment_group_id: payload.new.investment_group_id,
              poll_title: payload.new.title
            },
            `/investment?tab=polls&group=${payload.new.investment_group_id}`,
            'View Poll'
          );
        }
      })
      .subscribe();

    // Subscribe to poll status changes
    const pollStatusSubscription = supabase
      .channel('poll_status_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'investment_polls'
      }, async (payload) => {
        console.log('Poll status changed:', payload);
        
        if (payload.new.status === 'closed' && payload.old.status === 'active') {
          // Get user's vote if they participated
          const { data: userVote } = await supabase
            .from('poll_votes')
            .select('*')
            .eq('poll_id', payload.new.id)
            .eq('voter_id', user.id)
            .single();

          if (userVote) {
            toast({
              title: 'Poll Closed',
              description: `The poll "${payload.new.title}" has been closed. View results now.`,
            });

            await sendNotification(
              user.id,
              'investment',
              'Poll Results Available',
              `The poll "${payload.new.title}" has been closed and results are now available`,
              {
                poll_id: payload.new.id,
                poll_title: payload.new.title
              },
              `/investment?tab=polls&poll=${payload.new.id}`,
              'View Results'
            );
          }
        }
      })
      .subscribe();

    // Subscribe to poll ending reminders
    const pollRemindersSubscription = supabase
      .channel('poll_reminders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investment_polls'
      }, async (payload) => {
        if (payload.new && payload.new.status === 'active') {
          const endTime = new Date(payload.new.ends_at);
          const now = new Date();
          const timeLeft = endTime.getTime() - now.getTime();
          
          // Remind 24 hours before closing
          if (timeLeft > 0 && timeLeft <= 24 * 60 * 60 * 1000) {
            // Check if user hasn't voted yet
            const { data: userVote } = await supabase
              .from('poll_votes')
              .select('id')
              .eq('poll_id', payload.new.id)
              .eq('voter_id', user.id)
              .single();

            if (!userVote) {
              toast({
                title: 'Poll Ending Soon',
                description: `The poll "${payload.new.title}" ends in less than 24 hours. Don't forget to vote!`,
              });

              await sendNotification(
                user.id,
                'investment',
                'Poll Ending Soon',
                `The poll "${payload.new.title}" ends in less than 24 hours. Cast your vote now!`,
                {
                  poll_id: payload.new.id,
                  poll_title: payload.new.title,
                  ends_at: payload.new.ends_at
                },
                `/investment?tab=polls&poll=${payload.new.id}`,
                'Vote Now'
              );
            }
          }
        }
      })
      .subscribe();

    return () => {
      pollsSubscription.unsubscribe();
      pollStatusSubscription.unsubscribe();
      pollRemindersSubscription.unsubscribe();
    };
  }, [user, toast, sendNotification]);
}
