import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontSelector } from './FontSelector';

interface SignatureTextInputProps {
  onSignatureChange: (signature: string, text: string, font: string) => void;
  disabled?: boolean;
}

export function SignatureTextInput({ onSignatureChange, disabled }: SignatureTextInputProps) {
  const [signatureText, setSignatureText] = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script');

  const generateSignature = (text: string, font: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = 'hsl(var(--background))';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = `40px "${font}", cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    
    return canvas.toDataURL();
  };

  const handleTextChange = (text: string) => {
    setSignatureText(text);
    if (text.trim()) {
      const signature = generateSignature(text, selectedFont);
      onSignatureChange(signature, text, selectedFont);
    } else {
      onSignatureChange('', '', selectedFont);
    }
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    if (signatureText.trim()) {
      const signature = generateSignature(signatureText, font);
      onSignatureChange(signature, signatureText, font);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Type Your Signature</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signature-text">Your Full Name</Label>
          <Input
            id="signature-text"
            placeholder="Enter your full name"
            value={signatureText}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={disabled}
          />
        </div>
        
        <FontSelector
          selectedFont={selectedFont}
          onFontChange={handleFontChange}
          disabled={disabled}
        />
        
        {signatureText && (
          <div className="p-4 border border-border rounded-lg bg-background">
            <div 
              className="text-center text-foreground"
              style={{ 
                fontFamily: `"${selectedFont}", cursive`,
                fontSize: '24px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {signatureText}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}