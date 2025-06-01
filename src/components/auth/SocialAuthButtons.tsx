
'use client';

import { Button } from '@/components/ui/button';
import { GoogleLogo, GithubLogo, TwitterLogo } from 'phosphor-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function SocialAuthButtons() {
  const { toast } = useToast();

  const handleSocialAuth = async (provider: 'google' | 'github' | 'twitter') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during authentication",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialAuth('google')}
        className="border-gray-300 hover:bg-gray-50"
        title="Sign in with Google"
      >
        <GoogleLogo className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialAuth('github')}
        className="border-gray-300 hover:bg-gray-50"
        title="Sign in with GitHub"
      >
        <GithubLogo className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialAuth('twitter')}
        className="border-gray-300 hover:bg-gray-50"
        title="Sign in with Twitter"
      >
        <TwitterLogo className="h-4 w-4" />
      </Button>
    </div>
  );
}
