import { useState } from "react";
import {
  useDocumentVerificationRequests,
  useUpdateDocumentVerificationRequest,
} from "@/hooks/usePropertyVerificationTasks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyIcon,
  FileTextIcon,
  EyeIcon,
  CalendarBlankIcon,
  UploadSimpleIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { PropertyDocumentVerificationListSkeleton } from "./PropertyDocumentVerificationListSkeleton";
import { DocumentViewer } from "./DocumentViewer";
import { useAuth } from "@/lib/auth";
import { usePropertyDocument } from "@/hooks/usePropertyDocument";
import { VerificationStatusBadge } from "./VerificationStatusBadge";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/utils";

interface PropertyDocumentVerificationListProps {
  propertyId: string;
  canEdit?: boolean; // add this
}

interface VerificationDialogProps {
  request: any;
  onUpdate: (requestId: string, updates: any) => Promise<void>;
  onDocumentUpdate: (params: {
    documentId: string;
    status: "verified" | "rejected";
    notes?: string;
    verifiedBy?: string;
  }) => Promise<void>;
}

function VerificationDialog({
  request,
  onUpdate,
  onDocumentUpdate,
  open,
  setOpen,
}: VerificationDialogProps & { open: boolean; setOpen: (v: boolean) => void }) {
  const [status, setStatus] = useState(request.status || "pending");
  const [notes, setNotes] = useState(request.notes || "");
  const [documentStatus, setDocumentStatus] = useState(
    request.property_documents?.status || "pending"
  );
  const [documentNotes, setDocumentNotes] = useState(
    request.property_documents?.verification_notes || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const { user } = useAuth();

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Update verification request
      await onUpdate(request.id, {
        status,
        notes,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      });

      // Update property document
      await onDocumentUpdate({
        documentId: request.property_documents.id,
        status: documentStatus,
        notes: documentNotes,
        verifiedBy: user?.id,
      });
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogContent className="max-w-4xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            {request.property_documents?.document_name ||
              "Document Verification"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-6 p-4 md:p-0">
          {/* Document Viewer Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Document</h3>
            </div>

            <div className="gap-4 text-sm">
              <Badge>
                {capitalize(request.property_documents?.document_type)}
              </Badge>
              <div>
                <span className="font-medium flex items-center gap-2 mt-2">
                  <CalendarBlankIcon />
                  {request.property_documents?.created_at
                    ? new Date(
                        request.property_documents.created_at
                      ).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="font-medium flex items-center gap-2 mt-2">
                  <UploadSimpleIcon />
                  {request.property_documents?.file_size
                    ? `${(
                        request.property_documents.file_size /
                        1024 /
                        1024
                      ).toFixed(2)} MB`
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="font-medium font-medium flex items-center gap-2 mt-2">
                  <UserIcon />
                  {request.requester
                    ? `${request.requester.first_name} ${request.requester.last_name}`
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDocumentViewer(true)}
                size="sm"
                className="flex"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Document
              </Button>
            </div>
          </div>

          {/* Verification Request Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Verification Request</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Verification Notes
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about the verification process..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Property Document Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Document Status</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Document Status
                </label>
                <Select
                  value={documentStatus}
                  onValueChange={setDocumentStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Document Notes
                </label>
                <Textarea
                  value={documentNotes}
                  onChange={(e) => setDocumentNotes(e.target.value)}
                  placeholder="Add specific notes about the document..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? "Updating..." : "Update Verification"}
            </Button>
          </div>
        </div>

        {/* Document Viewer Modal */}
        {showDocumentViewer && request.property_documents?.file_url && (
          <DocumentViewer
            documentUrl={request.property_documents.file_url}
            documentName={request.property_documents.document_name}
            mimeType={request.property_documents.mime_type}
            onClose={() => setShowDocumentViewer(false)}
            isVerificationMode={true}
          />
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export function PropertyDocumentVerificationList({
  propertyId,
  canEdit = true,
}: PropertyDocumentVerificationListProps) {
  const { requests, loading, error, refetch } =
    useDocumentVerificationRequests(propertyId);
  const { updateRequest } = useUpdateDocumentVerificationRequest();
  const { verifyDocument } = usePropertyDocument();
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const handleUpdateRequest = async (requestId: string, updates: any) => {
    const result = await updateRequest(requestId, updates);
    if (result.success) {
      refetch();
    }
  };

  const handleUpdateDocument = async (
    documentId: string,
    updates: {
      documentId: string;
      status: "verified" | "rejected";
      notes?: string;
      verifiedBy?: string;
    }
  ) => {
    const result = await verifyDocument(
      documentId,
      updates.status,
      updates.notes,
      updates.verifiedBy
    );
    if (result) {
      refetch();
    }
  };

  if (loading) return <PropertyDocumentVerificationListSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;

  if (!requests.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center text-center text-gray-500 py-8">
          <EmptyIcon size={45} className="mb-2" />
          No documents found for this property.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!canEdit && (
        <div className="p-2 bg-yellow-50 text-yellow-800 rounded mb-2">
          You cannot review or verify documents for this task.
        </div>
      )}
      {requests.map((req) => (
        <div key={req.id}>
          <Card
            onClick={canEdit ? () => setOpenDialogId(req.id) : undefined}
            className={
              "transition " +
              (canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-60")
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5" />
                  <span className="text-md">
                    {req.property_documents?.document_name ||
                      "Unnamed Document"}
                  </span>
                  <VerificationStatusBadge status={req.status} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  {req.property_documents?.document_type}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span>{" "}
                  {req.property_documents?.created_at
                    ? new Date(
                        req.property_documents.created_at
                      ).toLocaleString()
                    : "N/A"}
                </div>
                <div>
                  <span className="font-medium">Requested By:</span>{" "}
                  {req.requester
                    ? `${req.requester.first_name} ${req.requester.last_name}`
                    : "N/A"}
                </div>
                {req.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>{" "}
                    <span className="text-gray-600">{req.notes}</span>
                  </div>
                )}
                {req.property_documents?.verification_notes && (
                  <div>
                    <span className="font-medium">Document Notes:</span>{" "}
                    <span className="text-gray-600">
                      {req.property_documents.verification_notes}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Dialog rendered outside the Card, controlled by openDialogId */}
          {openDialogId === req.id && canEdit && (
            <VerificationDialog
              request={req}
              onUpdate={handleUpdateRequest}
              open={openDialogId === req.id}
              setOpen={(v) =>
                v ? setOpenDialogId(req.id) : setOpenDialogId(null)
              }
              onDocumentUpdate={async (params) => {
                handleUpdateDocument(params.documentId, params);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
