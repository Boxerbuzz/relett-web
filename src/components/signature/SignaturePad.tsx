import React, { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrashIcon } from '@phosphor-icons/react';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  disabled?: boolean;
}

export function SignaturePad({ onSignatureChange, disabled }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    sigRef.current?.clear();
    onSignatureChange('');
  };

  const handleSignatureEnd = () => {
    if (sigRef.current) {
      const signature = sigRef.current.toDataURL();
      onSignatureChange(signature);
    }
  };

  useEffect(() => {
    if (disabled && sigRef.current) {
      sigRef.current.off();
    }
  }, [disabled]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Draw Your Signature</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-border rounded-lg bg-background">
          <SignatureCanvas
            ref={sigRef}
            penColor="hsl(var(--foreground))"
            canvasProps={{
              width: 300,
              height: 150,
              className: 'w-full h-[150px] rounded-lg cursor-crosshair',
            }}
            onEnd={handleSignatureEnd}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className="w-full"
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Clear Signature
        </Button>
      </CardContent>
    </Card>
  );
}