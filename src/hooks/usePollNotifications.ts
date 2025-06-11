
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useNotificationDelivery } from './useNotificationDelivery';

interface PollPayload {
  id: string;
  investment_group_id: string;
  title: string;
  status: string;
  ends_at: string;
  created_by: string;
}

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
        const pollData = payload.new as PollPayload;
        
        // Get the investment group details
        const { data: groupData } = await supabase
          .from('investment_groups')
          .select('name, lead_investor_id')
          .eq('id', pollData.investment_group_id)
          .single();

        if (groupData && pollData.created_by !== user.id) {
          toast({
            title: 'New Poll Created',
            description: `A new poll "${pollData.title}" has been created in ${groupData.name}`,
          });

          // Send notification
          await sendNotification(
            user.id,
            'investment',
            'New Investment Poll',
            `A new poll "${pollData.title}" has been created in ${groupData.name}`,
            {
              poll_id: pollData.id,
              investment_group_id: pollData.investment_group_id,
              poll_title: pollData.title
            },
            `/investment?tab=polls&group=${pollData.investment_group_id}`,
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
        const oldData = payload.old as PollPayload;
        const newData = payload.new as PollPayload;
        
        if (newData.status === 'closed' && oldData.status === 'active') {
          // Get user's vote if they participated
          const { data: userVote } = await supabase
            .from('poll_votes')
            .select('*')
            .eq('poll_id', newData.id)
            .eq('voter_id', user.id)
            .single();

          if (userVote) {
            toast({
              title: 'Poll Closed',
              description: `The poll "${newData.title}" has been closed. View results now.`,
            });

            await sendNotification(
              user.id,
              'investment',
              'Poll Results Available',
              `The poll "${newData.title}" has been closed and results are now available`,
              {
                poll_id: newData.id,
                poll_title: newData.title
              },
              `/investment?tab=polls&poll=${newData.id}`,
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
        const pollData = payload.new as PollPayload;
        if (pollData && pollData.status === 'active') {
          const endTime = new Date(pollData.ends_at);
          const now = new Date();
          const timeLeft = endTime.getTime() - now.getTime();
          
          // Remind 24 hours before closing
          if (timeLeft > 0 && timeLeft <= 24 * 60 * 60 * 1000) {
            // Check if user hasn't voted yet
            const { data: userVote } = await supabase
              .from('poll_votes')
              .select('id')
              .eq('poll_id', pollData.id)
              .eq('voter_id', user.id)
              .single();

            if (!userVote) {
              toast({
                title: 'Poll Ending Soon',
                description: `The poll "${pollData.title}" ends in less than 24 hours. Don't forget to vote!`,
              });

              await sendNotification(
                user.id,
                'investment',
                'Poll Ending Soon',
                `The poll "${pollData.title}" ends in less than 24 hours. Cast your vote now!`,
                {
                  poll_id: pollData.id,
                  poll_title: pollData.title,
                  ends_at: pollData.ends_at
                },
                `/investment?tab=polls&poll=${pollData.id}`,
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
