import jsPDF from 'jspdf';

interface RentalAgreementData {
  property: any;
  rental: any;
  tenant: any;
  signature?: string;
  signatureText?: string;
  signatureFont?: string;
  signatureMethod?: 'pad' | 'text';
}

export class PDFGenerator {
  static async generateRentalAgreement(data: RentalAgreementData): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RENTAL AGREEMENT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Agreement details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const agreementText = [
      `This Rental Agreement is entered into between:`,
      ``,
      `LANDLORD: ${data.property?.user?.first_name || ''} ${data.property?.user?.last_name || ''}`,
      `TENANT: ${data.tenant?.first_name || ''} ${data.tenant?.last_name || ''}`,
      ``,
      `PROPERTY DETAILS:`,
      `Address: ${data.property?.location?.address || ''}, ${data.property?.location?.city || ''}, ${data.property?.location?.state || ''}`,
      `Property Type: ${data.property?.type || ''}`,
      `Monthly Rent: ₦${(data.rental?.price || 0).toLocaleString()}`,
      `Payment Plan: ${data.rental?.payment_plan || ''}`,
      `Move-in Date: ${new Date(data.rental?.move_in_date || '').toLocaleDateString()}`,
      ``,
      `TERMS AND CONDITIONS:`,
      `1. The tenant agrees to pay rent on time according to the specified payment plan.`,
      `2. The property must be maintained in good condition throughout the rental period.`,
      `3. No unauthorized modifications or alterations to the property are permitted.`,
      `4. The tenant is responsible for utility bills and maintenance costs as specified.`,
      `5. A security deposit is required and will be refunded upon satisfactory condition.`,
      `6. The landlord reserves the right to inspect the property with 24-hour notice.`,
      `7. Any damages beyond normal wear and tear will be deducted from security deposit.`,
      `8. The agreement can be terminated with proper notice as per local rental laws.`,
      ``,
      `SPECIAL REQUESTS:`,
      data.rental?.message || 'None specified',
      ``
    ];

    agreementText.forEach((line) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 15, yPosition);
      yPosition += 7;
    });

    // Signature section
    yPosition += 10;
    if (yPosition > 240) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('DIGITAL SIGNATURE:', 15, yPosition);
    yPosition += 15;

    // Add signature
    if (data.signature) {
      try {
        const img = new Image();
        img.src = data.signature;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        pdf.addImage(data.signature, 'PNG', 15, yPosition, 80, 30);
        yPosition += 35;
      } catch (error) {
        console.error('Error adding signature to PDF:', error);
      }
    }

    pdf.setFont('helvetica', 'normal');
    pdf.text(`Signed by: ${data.tenant?.first_name || ''} ${data.tenant?.last_name || ''}`, 15, yPosition);
    yPosition += 7;
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 15, yPosition);
    yPosition += 7;
    pdf.text(`Signature Method: ${data.signatureMethod === 'pad' ? 'Digital Signature Pad' : 'Typed Signature'}`, 15, yPosition);

    if (data.signatureMethod === 'text' && data.signatureFont) {
      yPosition += 7;
      pdf.text(`Font Used: ${data.signatureFont}`, 15, yPosition);
    }

    // Footer
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.text('This document has been digitally signed and is legally binding.', 15, yPosition);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, yPosition + 5);

    return pdf.output('blob');
  }

  static async downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}