
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GoogleLogo, GithubLogo, TwitterLogo } from 'phosphor-react';
import { SpinnerIcon } from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function SocialAuthButtons() {
  const { toast } = useToast();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialAuth = async (provider: 'google' | 'github' | 'twitter') => {
    try {
      setLoadingProvider(provider);
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
    } finally {
      setLoadingProvider(null);
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
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'google' ? (
          <SpinnerIcon className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleLogo className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialAuth('github')}
        className="border-gray-300 hover:bg-gray-50"
        title="Sign in with GitHub"
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'github' ? (
          <SpinnerIcon className="h-4 w-4 animate-spin" />
        ) : (
          <GithubLogo className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialAuth('twitter')}
        className="border-gray-300 hover:bg-gray-50"
        title="Sign in with Twitter"
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'twitter' ? (
          <SpinnerIcon className="h-4 w-4 animate-spin" />
        ) : (
          <TwitterLogo className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
