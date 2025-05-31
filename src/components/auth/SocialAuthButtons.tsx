
'use client';

import { Button } from '@/components/ui/button';
import { GoogleLogo, GithubLogo, TwitterLogo } from 'phosphor-react';

export function SocialAuthButtons() {
  const handleSocialAuth = (provider: string) => {
    console.log(`Authenticating with ${provider}`);
    // TODO: Implement social authentication
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialAuth('google')}
        className="border-gray-300 hover:bg-gray-50"
      >
        <GoogleLogo className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialAuth('github')}
        className="border-gray-300 hover:bg-gray-50"
      >
        <GithubLogo className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialAuth('twitter')}
        className="border-gray-300 hover:bg-gray-50"
      >
        <TwitterLogo className="h-4 w-4" />
      </Button>
    </div>
  );
}
