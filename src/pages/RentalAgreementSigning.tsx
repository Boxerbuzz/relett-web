import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeftIcon, CheckIcon, DownloadIcon, FileTextIcon } from '@phosphor-icons/react';
import { SignaturePad } from '@/components/signature/SignaturePad';
import { SignatureTextInput } from '@/components/signature/SignatureTextInput';
import { PDFGenerator } from '@/lib/pdfGenerator';
import { DocumentStorageService } from '@/lib/documentStorage';
import { useUserRentals } from '@/hooks/useUserBookings';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function RentalAgreementSigning() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: user } = useUserProfile();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'pad' | 'text'>('pad');
  const [signature, setSignature] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [signatureFont, setSignatureFont] = useState('Dancing Script');
  const [isSigning, setIsSigning] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch rental data
  const { data: rentals } = useUserRentals(user?.id || '');
  const rental = rentals?.find(r => r.id === id);

  useEffect(() => {
    if (!rental && rentals) {
      navigate('/bookings');
    }
  }, [rental, rentals, navigate]);

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

  const steps = [
    { title: 'Review Agreement', description: 'Read through all terms and conditions' },
    { title: 'Sign Document', description: 'Provide your digital signature' },
    { title: 'Confirm & Download', description: 'Finalize and get your signed copy' }
  ];

  const handleSignaturePadChange = (sig: string) => {
    setSignature(sig);
    setSignatureMethod('pad');
  };

  const handleSignatureTextChange = (sig: string, text: string, font: string) => {
    setSignature(sig);
    setSignatureText(text);
    setSignatureFont(font);
    setSignatureMethod('text');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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

    if (!signature) {
      toast({
        title: 'Signature required',
        description: 'Please provide your signature before proceeding.',
        variant: 'destructive'
      });
      return;
    }

    setIsSigning(true);

    try {
      // Generate PDF
      setIsGeneratingPDF(true);
      const pdfBlob = await PDFGenerator.generateRentalAgreement({
        property: rental?.property,
        rental: rental,
        tenant: user,
        signature,
        signatureText,
        signatureFont,
        signatureMethod
      });

      // Upload to storage
      const documentUrl = await DocumentStorageService.uploadSignedAgreement(
        rental!.id,
        pdfBlob,
        {
          method: signatureMethod,
          signatureText,
          signatureFont
        }
      );

      setIsGeneratingPDF(false);

      toast({
        title: 'Agreement signed successfully',
        description: 'Your rental agreement has been digitally signed and saved.',
      });

      // Move to final step
      setCurrentStep(2);
    } catch (error) {
      setIsGeneratingPDF(false);
      toast({
        title: 'Signing failed',
        description: 'There was an error signing the agreement. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownload = async () => {
    try {
      const documentUrl = await DocumentStorageService.getSignedAgreement(rental!.id);
      if (documentUrl) {
        await DocumentStorageService.downloadSignedAgreement(
          documentUrl,
          `rental-agreement-${rental!.property?.title}-${new Date().toISOString().split('T')[0]}.pdf`
        );
      }
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'There was an error downloading the agreement.',
        variant: 'destructive'
      });
    }
  };

  if (!rental) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading rental agreement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/bookings')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Bookings
          </Button>
          <Badge variant="outline">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 ${
                      index <= currentStep 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agreement Content */}
          <div className="lg:col-span-2">
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileTextIcon className="w-5 h-5" />
                    Rental Agreement - {rental.property?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6">
                      {/* Agreement Header */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Property</label>
                            <p className="font-medium">{rental.property?.title}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Tenant</label>
                            <p className="font-medium">{user?.first_name || ''} {user?.last_name || ''}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Rental Period</label>
                            <p className="font-medium">Starting {formatDate(rental.move_in_date || '')}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Monthly Rent</label>
                            <p className="font-medium">{formatCurrency(rental.price || 0)}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Terms and Conditions */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
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
                      </div>

                      <Separator />

                      {/* Property Details */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                        <div className="space-y-2">
                          <p><strong>Address:</strong> {rental.property?.location?.address}</p>
                          <p><strong>Property Type:</strong> {rental.property?.type}</p>
                          <p><strong>Payment Plan:</strong> {rental.payment_plan}</p>
                          {rental.message && (
                            <p><strong>Special Requests:</strong> {rental.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Digital Signature</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={signatureMethod} onValueChange={(value) => setSignatureMethod(value as 'pad' | 'text')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="pad">Draw Signature</TabsTrigger>
                      <TabsTrigger value="text">Type Signature</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pad" className="mt-6">
                      <SignaturePad onSignatureChange={handleSignaturePadChange} />
                    </TabsContent>
                    <TabsContent value="text" className="mt-6">
                      <SignatureTextInput onSignatureChange={handleSignatureTextChange} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Agreement Successfully Signed!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Signature Completed</h3>
                      <p className="text-muted-foreground">
                        Your rental agreement has been digitally signed and saved securely.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button onClick={handleDownload} className="w-full">
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download Signed Agreement
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/bookings')}
                      className="w-full"
                    >
                      Return to Bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Agreement Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agreement Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge 
                  variant={currentStep === 2 ? "default" : "outline"}
                  className="w-full justify-center py-2"
                >
                  {currentStep === 2 ? 'Signed' : 'Pending Signature'}
                </Badge>
              </CardContent>
            </Card>

            {/* Terms Acceptance */}
            {currentStep >= 0 && currentStep < 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Terms Acceptance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    />
                    <label 
                      htmlFor="terms" 
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I have read and agree to all terms and conditions of this rental agreement
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {currentStep === 0 && (
                    <Button 
                      onClick={handleNext}
                      disabled={!termsAccepted}
                      className="w-full"
                    >
                      Proceed to Sign
                    </Button>
                  )}
                  
                  {currentStep === 1 && (
                    <>
                      <Button 
                        onClick={handleSign}
                        disabled={!termsAccepted || !signature || isSigning}
                        className="w-full"
                      >
                        {isSigning ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            {isGeneratingPDF ? 'Generating PDF...' : 'Signing...'}
                          </>
                        ) : (
                          <>
                            <CheckIcon className="w-4 h-4 mr-2" />
                            Sign Agreement
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleBack}
                        className="w-full"
                      >
                        Back to Review
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Digital signatures are legally binding</p>
                  <p>• A copy will be sent to your email</p>
                  <p>• You can download the signed agreement anytime</p>
                  <p>• All signatures are encrypted and secure</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}