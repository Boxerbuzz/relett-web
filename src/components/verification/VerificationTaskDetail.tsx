"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircleIcon,
  XCircleIcon,
  FileTextIcon,
  HouseIcon,
  ArrowLeftIcon,
  FloppyDiskIcon,
} from "@phosphor-icons/react";
import { VerificationTask } from "./types";
import { capitalize } from "@/lib/utils";
import { VerificationStatusBadge } from "./VerificationStatusBadge";
import { useVerificationTaskDetailAction } from "@/hooks/usePropertyVerificationTasks";
import { PropertyDocumentVerificationList } from "./PropertyDocumentVerificationList";
import { useAuth } from "@/lib/auth";

interface VerificationTaskDetailProps {
  task: VerificationTask;
  onBack: () => void;
  onTaskUpdated: () => void;
}

const DEFAULT_CHECKLIST = {
  documents_complete: false,
  ownership_verified: false,
  property_exists: false,
  legal_compliance: false,
  valuation_reasonable: false,
  photos_authentic: false,
  location_verified: false,
  zoning_compliant: false,
};

export function VerificationTaskDetail({
  task,
  onBack,
  onTaskUpdated,
}: VerificationTaskDetailProps) {
  const { user } = useAuth();
  const canEdit =
    !!task.verifier_id && user?.id && user.id === task.verifier_id;

  const [verifierNotes, setVerifierNotes] = useState(task.verifier_notes || "");
  const [decision, setDecision] = useState<"approved" | "rejected" | "">("");
  const [decisionReason, setDecisionReason] = useState(
    task.decision_reason || ""
  );
  const [checklist, setChecklist] = useState(
    task.verification_checklist || DEFAULT_CHECKLIST
  );
  const { saveProgress, completeVerification, isUpdating, isSubmitting } =
    useVerificationTaskDetailAction({
      task,
      checklist,
      verifierNotes,
      decision,
      decisionReason,
      onTaskUpdated: onTaskUpdated,
      onBack: onBack,
      setChecklist,
      setVerifierNotes,
      setDecision,
      setDecisionReason,
    });

  const handleChecklistChange = (key: string, checked: boolean) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const formatPrice = (price: any) => {
    if (!price || typeof price !== "object") return "N/A";
    return `${price.currency || "₦"}${price.amount?.toLocaleString() || "N/A"}`;
  };

  const formatLocation = (location: any) => {
    if (!location || typeof location !== "object")
      return "Location not specified";
    return location.city || "Location not specified";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const checklistItems = [
    {
      key: "documents_complete",
      label: "All required documents are complete and legible",
    },
    {
      key: "ownership_verified",
      label: "Property ownership has been verified",
    },
    {
      key: "property_exists",
      label: "Property physically exists at stated location",
    },
    {
      key: "legal_compliance",
      label: "Property complies with local regulations",
    },
    { key: "valuation_reasonable", label: "Listed valuation is reasonable" },
    {
      key: "photos_authentic",
      label: "Property photos are authentic and recent",
    },
    { key: "location_verified", label: "Property location has been verified" },
    {
      key: "zoning_compliant",
      label: "Property is compliant with zoning requirements",
    },
  ];

  const allChecksPassed = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex-col items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>
        <div className="flex-1 mt-4">
          <h1 className="text-2xl font-bold">Verification Task Details</h1>
          <p className="text-muted-foreground">
            Review and verify property information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(task.priority)}>
            {capitalize(task.priority)} Priority
          </Badge>
          <VerificationStatusBadge status={task.status} />
        </div>
      </div>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HouseIcon className="w-5 h-5" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Property Title
              </label>
              <p className="font-medium">
                {task.properties.title || "Untitled Property"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Property Type
              </label>
              <p className="font-medium capitalize">{task.properties.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Location
              </label>
              <p className="font-medium">
                {formatLocation(task.properties.location)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Listed Price
              </label>
              <p className="font-medium">
                {formatPrice(task.properties.price)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Property Owner
              </label>
              <p className="font-medium">
                {task.properties.users?.first_name}{" "}
                {task.properties.users?.last_name}
              </p>
              <p className="text-sm text-gray-500">
                {task.properties.users?.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Task Created
              </label>
              <p className="font-medium">
                {new Date(task.created_at).toLocaleDateString()}
              </p>
              {task.deadline && (
                <p className="text-sm text-red-600">
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <PropertyDocumentVerificationList
        propertyId={task.property_id}
        canEdit={canEdit || false}
      />

      {/* Verification Checklist and Notes */}
      <div className="flex flex-col md:flex-row gap-4 md:items-stretch">
        {/* Verification Checklist */}
        <div className="flex-1 flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="w-5 h-5" />
                Verification Checklist
              </CardTitle>
              <CardDescription>
                Complete all verification checks before making a decision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {checklistItems.map((item) => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.key}
                    checked={checklist[item.key] || false}
                    onCheckedChange={(checked) =>
                      handleChecklistChange(item.key, !!checked)
                    }
                    disabled={!canEdit}
                  />
                  <label
                    htmlFor={item.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.label}
                  </label>
                </div>
              ))}

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  Progress: {Object.values(checklist).filter(Boolean).length} of{" "}
                  {checklistItems.length} checks completed
                  {allChecksPassed && (
                    <span className="text-green-600 font-medium ml-2">
                      ✓ All checks completed
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Notes */}
        <div className="flex-1 flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Verification Notes</CardTitle>
              <CardDescription>
                Provide detailed notes about your verification findings
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                value={verifierNotes}
                onChange={(e) => setVerifierNotes(e.target.value)}
                placeholder="Enter your verification notes here..."
                rows={6}
                className="resize-none flex-1"
                disabled={!canEdit}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decision Section */}
      {task.status !== "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Decision</CardTitle>
            <CardDescription>
              Make your final decision on this property verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Decision</label>
              <Select
                value={decision}
                onValueChange={(value: any) => setDecision(value)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
                      Approve Property
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center">
                      <XCircleIcon className="h-4 w-4 mr-2 text-red-600" />
                      Reject Property
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {decision === "rejected" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rejection Reason
                </label>
                <Textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Explain why this property is being rejected..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={saveProgress}
                disabled={isUpdating || !canEdit}
              >
                <FloppyDiskIcon className="w-4 h-4 mr-2" />
                {isUpdating ? "Saving..." : "Save Progress"}
              </Button>
              <Button
                onClick={completeVerification}
                disabled={
                  isSubmitting ||
                  !allChecksPassed ||
                  !verifierNotes.trim() ||
                  !canEdit
                }
                className={
                  decision === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {isSubmitting ? "Processing..." : `Complete Verification`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {!canEdit && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
          You cannot edit this task. It must be assigned to you.
        </div>
      )}
    </div>
  );
}
