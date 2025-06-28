
import { createTypedSupabaseClient, corsHeaders, createResponse, createCorsResponse } from '../shared/supabase-client.ts';

interface UserCreatedPayload {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  user_metadata?: any;
  app_metadata?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const supabase = createTypedSupabaseClient();
    const payload = await req.json() as UserCreatedPayload;
    
    console.log('New user created:', payload.id);

    // Create user profile in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: payload.id,
        email: payload.email || null,
        phone: payload.phone || null,
        user_type: 'user', // Default user type
        email_verified: !!payload.email_confirmed_at,
        phone_verified: !!payload.phone_confirmed_at,
        metadata: payload.user_metadata || {},
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return createResponse({ success: false, error: 'Failed to create user profile' }, 500);
    }

    // Create default notification preferences
    const { error: notifError } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: payload.id,
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        notification_types: {
          "property_updates": true,
          "payment_notifications": true,
          "system_announcements": true,
          "verification_updates": true,
          "investment_opportunities": true,
          "auction_notifications": true,
          "tokenization_updates": true,
          "dividend_alerts": true,
          "market_insights": false
        }
      });

    if (notifError) {
      console.error('Error creating notification preferences:', notifError);
      // Don't fail the entire operation for this
    }

    // Send welcome notification
    const { error: welcomeError } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.id,
        type: 'general',
        title: 'Welcome to ReaLett!',
        message: 'Your account has been created successfully. Complete your profile to get started.',
        metadata: {
          onboarding: true,
          user_created: true
        },
        action_url: '/profile',
        action_label: 'Complete Profile'
      });

    if (welcomeError) {
      console.error('Error sending welcome notification:', welcomeError);
      // Don't fail the entire operation for this
    }

    console.log('User onboarding completed successfully for:', payload.id);
    
    return createResponse({
      success: true,
      message: 'User created and onboarded successfully',
      data: { user_id: payload.id }
    });

  } catch (error) {
    console.error('Error in user-created-webhook:', error);
    return createResponse({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
