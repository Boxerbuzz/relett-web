import React, { useState } from 'react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileTextIcon, DownloadIcon, CheckIcon, XIcon } from '@phosphor-icons/react';
import { useToast } from '@/hooks/use-toast';

interface RentalAgreementSigningProps {
  isOpen: boolean;
  onClose: () => void;
  rental: any;
  onSigned?: () => void;
}

export function RentalAgreementSigning({ 
  isOpen, 
  onClose, 
  rental, 
  onSigned 
}: RentalAgreementSigningProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const handleSign = async () => {
    if (!termsAccepted) {
      toast({
        title: 'Please accept terms',
        description: 'You must accept the terms and conditions to sign the agreement.',
        variant: 'destructive'
      });
      return;
    }

    setIsSigning(true);
    
    try {
      // Simulate signing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Agreement signed successfully',
        description: 'The rental agreement has been digitally signed.',
      });
      
      onSigned?.();
    } catch (error) {
      toast({
        title: 'Signing failed',
        description: 'There was an error signing the agreement. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleTermsChange = (checked: boolean | "indeterminate") => {
    setTermsAccepted(checked === true);
  };

  const agreementTerms = [
    "The tenant agrees to pay rent on time according to the specified payment plan.",
    "The property must be maintained in good condition throughout the rental period.",
    "No unauthorized modifications or alterations to the property are permitted.",
    "The tenant is responsible for utility bills and maintenance costs as specified.",
    "A security deposit is required and will be refunded upon satisfactory condition of the property.",
    "The landlord reserves the right to inspect the property with 24-hour notice.",
    "Any damages beyond normal wear and tear will be deducted from the security deposit.",
    "The agreement can be terminated with proper notice as per local rental laws."
  ];

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent size="full" className="max-h-[90vh]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5" />
            Rental Agreement - {rental.property?.title}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="flex-1 overflow-hidden px-4 md:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Agreement Content */}
            <div className="lg:col-span-2">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {/* Agreement Header */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rental Agreement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Property</label>
                          <p className="font-medium">{rental.property?.title}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Tenant</label>
                          <p className="font-medium">
                            {rental.user?.first_name} {rental.user?.last_name}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Rental Period</label>
                          <p className="font-medium">Starting {formatDate(rental.move_in_date)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Monthly Rent</label>
                          <p className="font-medium">{formatCurrency(rental.price)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Terms and Conditions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Terms and Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {agreementTerms.map((term, index) => (
                          <div key={index} className="flex gap-3">
                            <span className="text-sm font-medium text-muted-foreground min-w-6">
                              {index + 1}.
                            </span>
                            <p className="text-sm">{term}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Property Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Property Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Address:</strong> {rental.property?.location?.address}</p>
                        <p><strong>Property Type:</strong> {rental.property?.type}</p>
                        <p><strong>Payment Plan:</strong> {rental.payment_plan}</p>
                        {rental.message && (
                          <p><strong>Special Requests:</strong> {rental.message}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>

            {/* Signing Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agreement Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="w-full justify-center py-2">
                    Pending Signature
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Digital Signature</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={termsAccepted}
                        onCheckedChange={handleTermsChange}
                      />
                      <label 
                        htmlFor="terms" 
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I have read and agree to all terms and conditions of this rental agreement
                      </label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button 
                      onClick={handleSign}
                      disabled={!termsAccepted || isSigning}
                      className="w-full"
                    >
                      {isSigning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Signing...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-4 h-4 mr-2" />
                          Sign Agreement
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Signature Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Digital signatures are legally binding</p>
                    <p>• A copy will be sent to your email</p>
                    <p>• You can download the signed agreement anytime</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <ResponsiveDialogFooter className="lg:hidden">
          <ResponsiveDialogCloseButton />
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
