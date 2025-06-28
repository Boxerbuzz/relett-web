
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { VerificationStatus } from "@/types/database";

interface KYCVerificationStatusProps {
  status: VerificationStatus;
  hasDocuments: boolean;
  hasIdentityVerification: boolean;
}

export function KYCVerificationStatus({
  status,
  hasDocuments,
  hasIdentityVerification,
}: KYCVerificationStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "verified":
        return {
          icon: <CheckCircleIcon className="h-6 w-6 text-green-600" />,
          title: "Verification Complete",
          description: "Your identity has been successfully verified",
          color: "bg-green-50 border-green-200",
          textColor: "text-green-800",
          progress: 100,
        };
      case "pending":
        return {
          icon: <ClockIcon className="h-6 w-6 text-yellow-600" />,
          title: "Verification in Progress",
          description: "Our team is reviewing your documents",
          color: "bg-yellow-50 border-yellow-200",
          textColor: "text-yellow-800",
          progress: 75,
        };
      case "rejected":
        return {
          icon: <XCircleIcon className="h-6 w-6 text-red-600" />,
          title: "Verification Rejected",
          description: "Please review the feedback and resubmit",
          color: "bg-red-50 border-red-200",
          textColor: "text-red-800",
          progress: 25,
        };
      default:
        return {
          icon: <FileTextIcon className="h-6 w-6 text-gray-600" />,
          title: "Verification Required",
          description: "Complete your identity verification to unlock all features",
          color: "bg-gray-50 border-gray-200",
          textColor: "text-gray-800",
          progress: hasIdentityVerification ? 50 : 0,
        };
    }
  };

  const statusInfo = getStatusInfo();

  const getStepStatus = (step: number) => {
    if (statusInfo.progress >= step * 25) {
      return "complete";
    } else if (statusInfo.progress >= (step - 1) * 25) {
      return "current";
    }
    return "pending";
  };

  return (
    <Card className={`${statusInfo.color} mb-6`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {statusInfo.icon}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${statusInfo.textColor}`}>
                {statusInfo.title}
              </h3>
              <Badge
                variant={status === "verified" ? "default" : "secondary"}
                className={
                  status === "verified"
                    ? "bg-green-100 text-green-800"
                    : status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {status === "unverified" ? "Not Started" : status}
              </Badge>
            </div>
            <p className={`text-sm ${statusInfo.textColor} mb-4`}>
              {statusInfo.description}
            </p>

            {/* Progress Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Verification Progress</span>
                <span>{statusInfo.progress}%</span>
              </div>
              <Progress value={statusInfo.progress} className="h-2" />
              
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className={`text-center ${getStepStatus(1) === 'complete' ? 'text-green-600' : getStepStatus(1) === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${getStepStatus(1) === 'complete' ? 'bg-green-600' : getStepStatus(1) === 'current' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  Identity Info
                </div>
                <div className={`text-center ${getStepStatus(2) === 'complete' ? 'text-green-600' : getStepStatus(2) === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${getStepStatus(2) === 'complete' ? 'bg-green-600' : getStepStatus(2) === 'current' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  Documents
                </div>
                <div className={`text-center ${getStepStatus(3) === 'complete' ? 'text-green-600' : getStepStatus(3) === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${getStepStatus(3) === 'complete' ? 'bg-green-600' : getStepStatus(3) === 'current' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  Review
                </div>
                <div className={`text-center ${getStepStatus(4) === 'complete' ? 'text-green-600' : getStepStatus(4) === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${getStepStatus(4) === 'complete' ? 'bg-green-600' : getStepStatus(4) === 'current' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  Complete
                </div>
              </div>
            </div>

            {status === "pending" && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Review Time:</strong> 24-48 hours
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  You'll receive a notification once your documents are reviewed.
                </p>
              </div>
            )}

            {status === "rejected" && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Next Steps:</strong> Please review the feedback and upload new documents.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
