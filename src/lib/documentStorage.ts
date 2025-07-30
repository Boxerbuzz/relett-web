import { supabase } from '@/integrations/supabase/client';

export class DocumentStorageService {
  static async uploadSignedAgreement(
    rentalId: string,
    pdfBlob: Blob,
    signatureData: {
      method: 'pad' | 'text';
      signatureText?: string;
      signatureFont?: string;
    }
  ): Promise<string> {
    try {
      const fileName = `rental-agreement-${rentalId}-${Date.now()}.pdf`;
      const filePath = `rental-agreements/${fileName}`;

      // Upload PDF to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-documents')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('property-documents')
        .getPublicUrl(filePath);

      const documentUrl = urlData.publicUrl;

      // Update rental metadata
      const { error: updateError } = await supabase
        .from('rentals')
        .update({
          metadata: {
            signed_agreement_url: documentUrl,
            signature_method: signatureData.method,
            signature_text: signatureData.signatureText,
            signature_font: signatureData.signatureFont,
            signed_at: new Date().toISOString(),
            document_path: filePath
          }
        })
        .eq('id', rentalId);

      if (updateError) throw updateError;

      return documentUrl;
    } catch (error) {
      console.error('Error uploading signed agreement:', error);
      throw error;
    }
  }

  static async getSignedAgreement(rentalId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select('metadata')
        .eq('id', rentalId)
        .single();

      if (error || !data) return null;

      const metadata = data.metadata as any;
      return metadata?.signed_agreement_url || null;
    } catch (error) {
      console.error('Error getting signed agreement:', error);
      return null;
    }
  }

  static async downloadSignedAgreement(url: string, filename: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading agreement:', error);
      throw error;
    }
  }
}