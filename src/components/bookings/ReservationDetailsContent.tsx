import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LinkSimpleIcon,
  MapPinIcon,
  CalendarIcon,
  CreditCardIcon,
  WarningIcon,
  CheckCircleIcon,
  CurrencyNgnIcon,
  HashIcon,
  ClockIcon,
  ReceiptIcon,
  MoonIcon,
  PersonIcon,
  BabyIcon,
  BabyCarriageIcon,
  CopyIcon,
  Calendar,
  ChatCenteredDots,
  ShareIcon,
  ChatCenteredDotsIcon,
  HeartIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { usePayment } from "@/hooks/usePayment";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { capitalize } from "@/lib/utils";

interface ReservationDetailsContentProps {
  reservation: any;
  agent?: {
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
  };
  onStatusUpdate?: (id: string, status: string) => void;
}

export function ReservationDetailsContent({
  reservation,
  agent,
  onStatusUpdate,
}: ReservationDetailsContentProps) {
  const { payment, loading, error, verifyPaymentStatus, retryPayment } =
    usePayment({
      relatedId: reservation.id,
      relatedType: "reservation",
      autoFetch: true,
    });
  const { toast } = useToast();

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

  const handleStatusUpdate = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(reservation.id, newStatus);
    }
  };

  const handleVerifyPayment = async () => {
    if (payment?.reference) {
      await verifyPaymentStatus(payment.reference);
    }
  };

  const handleRetryPayment = async () => {
    await retryPayment(reservation.id, "reservation");
  };

  const getPaymentStatusBadge = () => {
    if (loading) return <Skeleton className="h-6 w-20" />;

    const status = payment?.status || "pending";
    const variant =
      status === "success"
        ? "default"
        : status === "pending"
        ? "secondary"
        : "destructive";

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {status === "success" && <CheckCircleIcon className="w-3 h-3" />}
        {status === "pending" && <WarningIcon className="w-3 h-3" />}
        {status === "failed" && <WarningIcon className="w-3 h-3" />}
        {status}
      </Badge>
    );
  };

  const getActionButtons = () => {
    switch (reservation.status) {
      case "pending":
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => handleStatusUpdate("confirmed")}
              size="sm"
            >
              Confirm Reservation
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleStatusUpdate("cancelled")}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        );
      case "confirmed":
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => handleStatusUpdate("active")}
              size="sm"
            >
              Check-in Guest
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleStatusUpdate("cancelled")}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        );
      case "active":
        return (
          <Button onClick={() => handleStatusUpdate("completed")} size="sm">
            Check-out Guest
          </Button>
        );
      default:
        return null;
    }
  };

  const maskReference = (reference: string) => {
    if (!reference) return "";
    if (reference.length <= 12) return reference;

    const firstSix = reference.substring(0, 6);
    const lastSix = reference.substring(reference.length - 6);
    return `${firstSix}...${lastSix}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Reference copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy reference",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property Information */}
      {payment?.property && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {payment.property.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {payment.property.location?.address ||
                    "Address not available"}
                </p>
              </div>

              {payment.property.location && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">City:</span>{" "}
                    {payment.property.location.city || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">State:</span>{" "}
                    {payment.property.location.state || "N/A"}
                  </div>
                  {payment.property.location.landmark && (
                    <div className="col-span-2">
                      <span className="font-medium">Landmark:</span>{" "}
                      {payment.property.location.landmark}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <h4 className="font-medium">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className={"text-red-500 border-red-200"}
          >
            <HeartIcon size={16} className={"fill-current"} />
          </Button>
          <Button variant="outline" size="sm">
            <ShareIcon size={16} />
          </Button>
          <Button variant="outline" size="sm">
            <ChatCenteredDotsIcon size={16} />
          </Button>
          <Button variant="outline" size="sm">
            <CalendarIcon size={16} />
          </Button>
        </div>
      </div>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Payment Status</span>
              {getPaymentStatusBadge()}
            </div>

            {payment && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Amount</span>{" "}
                    <div className="flex items-center gap-2">
                      <ReceiptIcon className="w-4 h-4 text-muted-foreground" />
                      {formatCurrency(payment.amount / 100)}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Currency</span>{" "}
                    <div className="flex items-center gap-2">
                      <CurrencyNgnIcon className="w-4 h-4 text-muted-foreground" />
                      {payment.currency || "NGN"}
                    </div>
                  </div>
                  <div className="items-center gap-2">
                    <span className="font-medium">Reference</span>
                    <div className="flex gap-x-1">
                      <HashIcon className="w-4 h-4 text-muted-foreground" />

                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">
                          {payment.reference
                            ? maskReference(payment.reference)
                            : "N/A"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => copyToClipboard(payment.reference)}
                        >
                          <CopyIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Method</span>{" "}
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="w-4 h-4 text-muted-foreground" />

                      {capitalize(payment.method || "Card")}
                    </div>
                  </div>
                </div>

                {payment.paid_at && (
                  <div>
                    <span className="font-medium">Paid At</span>{" "}
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-muted-foreground" />

                      {formatDate(payment.paid_at)}
                    </div>
                  </div>
                )}

                {payment.link && payment.status !== "success" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(payment.link || "", "_blank")}
                    >
                      <LinkSimpleIcon className="w-4 h-4 mr-2" />
                      Pay Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyPayment}
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Verify Payment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryPayment}
                    >
                      <WarningIcon className="w-4 h-4 mr-2" />
                      Retry Payment
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reservation Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Reservation Overview
            </CardTitle>
            <Badge variant="outline">{reservation.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium flex gap-x-1">
                <CalendarIcon /> Check-in
              </label>
              <div className="text-sm">{formatDate(reservation.from_date)}</div>
            </div>
            <div>
              <label className="text-sm font-medium flex gap-x-1">
                <CalendarIcon />
                Check-out
              </label>
              <div className="text-sm">{formatDate(reservation.to_date)}</div>
            </div>
            <div>
              <label className="text-sm font-medium flex gap-x-1">
                <MoonIcon /> Duration
              </label>
              <div className="text-sm">{reservation.nights || 0} nights</div>
            </div>
            <div>
              <label className="text-sm font-medium flex gap-x-1">
                <HashIcon />
                Total Amount
              </label>
              <div className="text-sm font-semibold">
                {formatCurrency(reservation.total)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium flex gap-x-1">
                <PersonIcon />
                Adults
              </label>
              <div className="text-sm">
                {reservation.adults || 0}{" "}
                {reservation.adults > 1 ? "Adults" : "Adult"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium flex gap-x-1">
                <BabyIcon />
                Children
              </label>
              <div className="text-sm">
                {reservation.children || 0}{" "}
                {reservation.children > 1 ? "Children" : "Child"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium flex gap-x-1">
                <BabyCarriageIcon />
                Infants
              </label>
              <div className="text-sm">
                {reservation.infants || 0}{" "}
                {reservation.infants > 1 ? "Infants" : "Infant"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Total Guests</label>
              <div className="text-sm font-semibold">
                {(reservation.adults || 0) +
                  (reservation.children || 0) +
                  (reservation.infants || 0)}

                {}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Amount</span>
              <span>
                {formatCurrency(reservation.total - (reservation.fee || 0))}
              </span>
            </div>
            {reservation.fee && (
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>{formatCurrency(reservation.fee)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(reservation.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Requests */}
      {reservation.note && (
        <Card>
          <CardHeader>
            <CardTitle>Special Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">{reservation.note}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
