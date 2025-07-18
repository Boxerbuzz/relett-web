import { PropertyDocumentViewer } from "@/components/property/PropertyDocumentViewer";

interface PropertyDocumentsDetailsSectionProps {
  propertyId: string;
  propertyDocuments: Array<{
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    status: string | null;
    verified_at: string | null;
  }>;
}

export function PropertyDocumentsDetailsSection({ propertyId, propertyDocuments }: PropertyDocumentsDetailsSectionProps) {
  if (!propertyDocuments || propertyDocuments.length === 0) return null;
  return (
    <PropertyDocumentViewer
      propertyId={propertyId}
      documents={propertyDocuments.map((doc) => ({
        id: doc.id,
        document_name: doc.document_name,
        document_type: doc.document_type,
        file_url: doc.file_url,
        status: doc.status,
        verified_at: doc.verified_at,
        file_size: 0,
        mime_type: "",
        created_at: new Date().toISOString(),
      }))}
    />
  );
} 