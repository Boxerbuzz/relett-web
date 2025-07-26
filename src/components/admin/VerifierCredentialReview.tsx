import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CertificateIcon,
  FileTextIcon,
  CalendarIcon,
  UserIcon,
} from "@phosphor-icons/react";

interface VerifierCredential {
  id: string;
  user_id: string;
  license_name: string;
  license_number: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  verifier_type: string;
  verification_status: string;
  documents: any[];
  is_active: boolean;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_notes?: string;
  user?: {
    first_name: string;
    last_name: string;
    phone?: string;
  } | null;
}

export function VerifierCredentialReview() {
  const [credentials, setCredentials] = useState<VerifierCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from("verifier_credentials")
        .select(
          `
          *,
          user: users!verifier_credentials_user_id_fkey (
            first_name,
            last_name,
            phone
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCredentials(
        (data || []).map((item) => ({
          ...item,
          documents: Array.isArray(item.documents) ? item.documents : [],
          user: item.user && !("error" in item.user) ? item.user : null,
        })) as VerifierCredential[]
      );
    } catch (error) {
      console.error("Error fetching credentials:", error);
      toast({
        title: "Error",
        description: "Failed to load verifier credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    credentialId: string,
    decision: "verified" | "rejected"
  ) => {
    try {
      setReviewingId(credentialId);

      const { error } = await supabase
        .from("verifier_credentials")
        .update({
          verification_status: decision,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewer_notes: reviewNotes,
          is_active: decision === "verified",
        })
        .eq("id", credentialId);

      if (error) throw error;

      await fetchCredentials();
      setReviewNotes("");
      setReviewingId(null);

      toast({
        title: "Success",
        description: `Credential ${decision} successfully`,
      });
    } catch (error) {
      console.error("Error reviewing credential:", error);
      toast({
        title: "Error",
        description: "Failed to review credential",
        variant: "destructive",
      });
    } finally {
      setReviewingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return CheckCircleIcon;
      case "rejected":
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifier Credential Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading credentials...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {credentials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No credentials to review
        </div>
      ) : (
        credentials.map((credential) => {
          const StatusIcon = getStatusIcon(credential.verification_status);
          return (
            <div
              key={credential.id}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {credential.user?.first_name || "Unknown"}{" "}
                      {credential.user?.last_name || "User"}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {credential.verifier_type.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CertificateIcon className="h-3 w-3" />
                      <span>{credential.license_name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={getStatusColor(credential.verification_status)}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {credential.verification_status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-700">
                    License Number
                  </label>
                  <p className="text-gray-600">{credential.license_number}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">
                    Issuing Authority
                  </label>
                  <p className="text-gray-600">
                    {credential.issuing_authority}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">
                    Issue Date
                  </label>
                  <p className="text-gray-600">
                    {new Date(credential.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <p className="text-gray-600">
                    {new Date(credential.expiry_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {credential.documents.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700">
                    Supporting Documents
                  </label>
                  <div className="flex gap-2 mt-2">
                    {credential.documents.map((doc, index) => (
                      <Button key={index} variant="outline" size="sm" asChild>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileTextIcon className="h-3 w-3 mr-1" />
                          {doc.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {credential.verification_status === "pending" && (
                <div className="border-t pt-4 space-y-3">
                  <Textarea
                    placeholder="Add review notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReview(credential.id, "verified")}
                      disabled={reviewingId === credential.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                    <Button
                      onClick={() => handleReview(credential.id, "rejected")}
                      disabled={reviewingId === credential.id}
                      variant="destructive"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {credential.reviewer_notes && (
                <div className="border-t pt-4">
                  <label className="font-medium text-gray-700">
                    Review Notes
                  </label>
                  <p className="text-gray-600 text-sm">
                    {credential.reviewer_notes}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Reviewed on{" "}
                    {new Date(credential.reviewed_at!).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
