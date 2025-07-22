import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  FileTextIcon,
  ChatTextIcon,
} from "@phosphor-icons/react";
import { RentalAgreementSigning } from "./RentalAgreementSigning";

interface RentalDetailsContentProps {
  rental: any;
  onStatusUpdate?: (id: string, status: string) => void;
}

export function RentalDetailsContent({
  rental,
  onStatusUpdate,
}: RentalDetailsContentProps) {
  const [showAgreement, setShowAgreement] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const getRentalSteps = () => {
    const steps = [
      {
        id: "pending",
        title: "Application Submitted",
        description: "Rental application received",
        completed: true,
        current: rental.status === "pending",
      },
      {
        id: "approved",
        title: "Application Approved",
        description: "Application reviewed and approved",
        completed: [
          "approved",
          "agreement_pending",
          "agreement_signed",
          "active",
          "completed",
        ].includes(rental.status),
        current: rental.status === "approved",
      },
      {
        id: "agreement_pending",
        title: "Agreement Signing",
        description: "Rental agreement needs to be signed",
        completed: ["agreement_signed", "active", "completed"].includes(
          rental.status
        ),
        current: rental.status === "agreement_pending",
      },
      {
        id: "agreement_signed",
        title: "Agreement Signed",
        description: "Rental agreement has been signed",
        completed: ["active", "completed"].includes(rental.status),
        current: rental.status === "agreement_signed",
      },
      {
        id: "active",
        title: "Rental Active",
        description: "Tenant has moved in",
        completed: rental.status === "completed",
        current: rental.status === "active",
      },
      {
        id: "completed",
        title: "Rental Completed",
        description: "Rental period has ended",
        completed: rental.status === "completed",
        current: rental.status === "completed",
      },
    ];

    return steps;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(rental.id, newStatus);
    }
  };

  const getActionButtons = () => {
    switch (rental.status) {
      case "pending":
        return (
          <div className="flex gap-2">
            <Button onClick={() => handleStatusUpdate("approved")} size="sm">
              Approve Application
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate("rejected")}
              size="sm"
            >
              Reject
            </Button>
          </div>
        );
      case "approved":
        return (
          <Button
            onClick={() => handleStatusUpdate("agreement_pending")}
            size="sm"
          >
            Send Agreement
          </Button>
        );
      case "agreement_pending":
        return (
          <div className="flex gap-2">
            <Button onClick={() => setShowAgreement(true)} size="sm">
              <FileTextIcon className="w-4 h-4 mr-2" />
              View Agreement
            </Button>
            <Button
              onClick={() => handleStatusUpdate("agreement_signed")}
              variant="outline"
              size="sm"
            >
              Mark as Signed
            </Button>
          </div>
        );
      case "agreement_signed":
        return (
          <Button onClick={() => handleStatusUpdate("active")} size="sm">
            Activate Rental
          </Button>
        );
      case "active":
        return (
          <Button
            onClick={() => handleStatusUpdate("completed")}
            variant="outline"
            size="sm"
          >
            Complete Rental
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Rental Process Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Process</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressIndicator steps={getRentalSteps()} orientation="vertical" />
        </CardContent>
      </Card>

      {/* Rental Details */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Payment Plan
              </label>
              <p className="font-medium">{rental.payment_plan}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Move-in Date
              </label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{formatDate(rental.move_in_date)}</p>
              </div>
            </div>
            {rental.price && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Rental Price
                </label>
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{formatCurrency(rental.price)}</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Payment Status
              </label>
              <Badge className={getPaymentStatusColor(rental.payment_status)}>
                {rental.payment_status}
              </Badge>
            </div>
          </div>

          {rental.message && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Message from Tenant
                </label>
                <div className="bg-muted p-3 rounded-lg mt-2">
                  <p className="text-sm">{rental.message}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getActionButtons()}
            <Button variant="outline" size="sm">
              <ChatTextIcon className="w-4 h-4 mr-2" />
              Contact Tenant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rental Agreement Modal */}
      <RentalAgreementSigning
        isOpen={showAgreement}
        onClose={() => setShowAgreement(false)}
        rental={rental}
        onSigned={() => {
          handleStatusUpdate("agreement_signed");
          setShowAgreement(false);
        }}
      />
    </div>
  );
}
