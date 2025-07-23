import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCardIcon,
  ReceiptIcon,
  WarningIcon,
  CalendarIcon,
  FileTextIcon,
  ChatTextIcon,
  CurrencyDollarIcon,
  BedIcon,
  BathtubIcon,
  RulerIcon,
  ArmchairIcon,
  LinkIcon,
  CheckCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Stepper from "awesome-react-stepper";
import { useMediaQuery } from "@/hooks/useMediaQuery";
// You must have installed awesome-react-stepper
// npm install awesome-react-stepper
import { RentalAgreementSigning } from "./RentalAgreementSigning";
import { Tooltip } from "../ui/tooltip";
import { capitalize } from "@/lib/utils";

interface RentalDetailsContentProps {
  rental: any;
}

export function RentalDetailsContent({ rental }: RentalDetailsContentProps) {
  const [showAgreement, setShowAgreement] = useState(false);

  // Helper to safely get property info (supporting both .property and .properties)
  const property = rental.property || rental.properties || {};

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount == null) return "-";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Steps for awesome-react-stepper
  const stepperSteps = [
    {
      label: "Application",
      icon: <CalendarIcon size={16} />,
    },
    {
      label: "Approved",
      icon: <CreditCardIcon size={16} />,
    },
    {
      label: "Agreement",
      icon: <FileTextIcon size={16} />,
    },
    {
      label: "Signed",
      icon: <FileTextIcon size={16} />,
    },
    {
      label: "Confirmed",
      icon: <ReceiptIcon size={16} />,
    },
    {
      label: "Active",
      icon: <ArmchairIcon size={16} />,
    },
    {
      label: "Completed",
      icon: <CheckCircle size={16} />,
    },
  ];
  // Map rental.status to step index
  const statusMap = {
    pending: 0,
    approved: 1,
    agreement_pending: 2,
    agreement_signed: 3,
    confirmed: 4,
    active: 5,
    completed: 6,
  };
  const activeStep = statusMap[rental.status] ?? 0;

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

  // User-centric action buttons
  const getUserActions = (): JSX.Element[] => {
    const actions: JSX.Element[] = [];
    if (rental.payment_status !== "paid" && rental.payment_url) {
      actions.push(
        <Tooltip>
          <Button asChild size="sm" key="pay-rent">
            <a
              href={rental.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pay Now"
            >
              <CreditCardIcon className="w-5 h-5" />
            </a>
          </Button>
        </Tooltip>
      );
    }
    if (rental.payment_status === "paid") {
      actions.push(
        <Button size="sm" variant="outline" key="download-receipt">
          Download Receipt
        </Button>
      );
    }
    if (["active", "confirmed"].includes(rental.status)) {
      actions.push(
        <Button size="sm" variant="outline" key="request-maintenance">
          Request Maintenance
        </Button>
      );
    }
    if (
      [
        "pending",
        "approved",
        "agreement_pending",
        "agreement_signed",
        "confirmed",
      ].includes(rental.status)
    ) {
      actions.push(
        <Button size="sm" variant="destructive" key="cancel-rental">
          Cancel Rental
        </Button>
      );
    }
    if (
      ["agreement_signed", "confirmed", "active", "completed"].includes(
        rental.status
      )
    ) {
      actions.push(
        <Button
          size="sm"
          variant="outline"
          key="view-agreement"
          onClick={() => setShowAgreement(true)}
        >
          <FileTextIcon className="w-4 h-4 mr-2" />
          View Agreement
        </Button>
      );
    }
    return actions;
  };

  // Property Overview Card
  const mainImage =
    property.property_images?.find((img: any) => img.is_primary)?.url ||
    property.property_images?.[0]?.url;
  const spec = property.specification || {};
  const location = property.location || {};

  const isMobile = useMediaQuery("(max-width: 767px)");
  return (
    <div className="space-y-6">
      {/* Property Overview */}
      <Card>
        <div className="flex flex-col md:flex-row">
          {mainImage && (
            <img
              src={mainImage}
              alt={property.title}
              className="w-full sm:w-64 h-48 object-cover rounded-t-md md:rounded-l-md md:rounded-tr-none"
            />
          )}
          <div className="flex-1 p-4 space-y-2">
            <h2 className="text-xl font-bold">{property.title}</h2>
            <div className="text-muted-foreground text-sm">
              {location.address}, {location.city}, {location.state}
            </div>
            <div className="flex gap-4 mt-2">
              <span className="flex gap-x-1 text-sm">
                <BedIcon size={17} /> {spec.bedrooms} Bed
              </span>
              <span className="flex gap-x-1 text-sm">
                <BathtubIcon size={17} />
                {spec.bathrooms} Bath
              </span>
              <span className="flex gap-x-1 text-sm">
                <RulerIcon size={17} />
                {spec.area} {spec.area_unit || "sqft"}
              </span>
              {spec.is_furnished && (
                <span className="flex gap-x-1 text-sm">
                  <ArmchairIcon size={17} /> Furnished
                </span>
              )}
            </div>
            <div className="font-semibold mt-2">
              {formatCurrency(property.price?.amount / 100)} /
              {property.price?.term}
            </div>
            <Button asChild variant="link" size="sm" className="p-0 h-auto">
              <a
                title="View Property"
                href={`/property/${property.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon size={18} />
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Rental Progress Stepper */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Stepper
            defaultActiveStep={activeStep + 1}
            showProgressBar={true}
            barWidth={"100%"}
            contentBoxClassName="flex flex-col gap-0"
          >
            <div className="flex items-center gap-1 mb-1">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300">
                <CalendarIcon size={12} />
              </span>
              <span className="text-xs font-medium">Application</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300">
                <CreditCardIcon size={12} />
              </span>
              <span className="text-xs font-medium">Approved</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300">
                <FileTextIcon size={12} />
              </span>
              <span className="text-xs font-medium">Agreement</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300">
                <FileTextIcon size={12} />
              </span>
              <span className="text-xs font-medium">Signed</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300">
                <ReceiptIcon size={12} />
              </span>
              <span className="text-xs font-medium">Confirmed</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300">
                <ArmchairIcon size={12} />
              </span>
              <span className="text-xs font-medium">Active</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300">
                <CheckCircle size={12} />
              </span>
              <span className="text-xs font-medium">Completed</span>
            </div>
          </Stepper>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h4 className="font-medium">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          {/* Pay Now Icon Button */}
          {rental.payment_status !== "paid" && rental.payment_url && (
            <Button asChild variant="outline" size="icon" title="Pay Now">
              <a
                title="Pay Now"
                href={rental.payment_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CreditCardIcon className="w-5 h-5" />
              </a>
            </Button>
          )}
          {/* Download Receipt */}
          {rental.payment_status === "paid" && (
            <Button variant="outline" size="icon" title="Download Receipt">
              <ReceiptIcon className="w-5 h-5" />
            </Button>
          )}
          {/* Request Maintenance */}
          {["active", "confirmed"].includes(rental.status) && (
            <Button variant="outline" size="icon" title="Request Maintenance">
              <WarningIcon className="w-5 h-5" />
            </Button>
          )}
          {/* Cancel Rental */}
          {[
            "pending",
            "approved",
            "agreement_pending",
            "agreement_signed",
            "confirmed",
          ].includes(rental.status) && (
            <Button variant="destructive" size="icon" title="Cancel Rental">
              <CalendarIcon className="w-5 h-5" />
            </Button>
          )}
          {/* View Agreement */}
          {["agreement_signed", "confirmed", "active", "completed"].includes(
            rental.status
          ) && (
            <Button
              variant="outline"
              size="icon"
              title="View Agreement"
              onClick={() => setShowAgreement(true)}
            >
              <FileTextIcon className="w-5 h-5" />
            </Button>
          )}
          {/* Contact Support/Agent */}
          <Button variant="outline" size="icon" title="Contact Support/Agent">
            <ChatTextIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

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
              <p className="font-medium">{capitalize(rental.payment_plan)}</p>
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
                  Initial Payment
                </label>
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{formatCurrency(rental.price)}</p>
                </div>
              </div>
            )}
            <div className="">
              <label className="text-sm font-medium text-muted-foreground">
                Payment Status
              </label>
              <Badge className={getPaymentStatusColor(rental.payment_status)}>
                {capitalize(rental.payment_status)}
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

      {/* Rental Agreement Modal */}
      <RentalAgreementSigning
        isOpen={showAgreement}
        onClose={() => setShowAgreement(false)}
        rental={rental}
        onSigned={() => setShowAgreement(false)}
      />
    </div>
  );
}
