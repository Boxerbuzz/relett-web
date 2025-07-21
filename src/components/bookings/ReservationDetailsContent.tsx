import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LinkSimpleIcon,
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
  ShareIcon,
  ChatCenteredDotsIcon,
  CalendarIcon,
  MapPinIcon,
  RulerIcon,
  BedIcon,
  BathtubIcon,
  CarIcon,
  StackIcon,
  ChairIcon,
  ToiletIcon,
  LetterCirclePIcon,
  PathIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { usePayment } from "@/hooks/usePayment";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { capitalize } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from "@/components/ui/responsive-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { DateRange } from "react-day-picker";
import { CoordinatesDirectionsButton } from "../ui/directions-button";

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

// Minimal UI-only dialog components
// --- Reschedule Reservation Dialog ---
function RescheduleReservationDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Reschedule Reservation</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-4">
          <div>
            <Label>New Check-in &amp; Check-out Dates</Label>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
              className="w-full"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton />
          <Button type="button" disabled={!dateRange || !dateRange.from}>
            Submit Reschedule
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// --- Report Reservation Dialog ---
function ReportReservationDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Report an Issue</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Reason</Label>
            <RadioGroup
              value={reason}
              onValueChange={setReason}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="property_misrepresented"
                  id="report-reason-1"
                />
                <Label htmlFor="report-reason-1">Property Misrepresented</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="host_unresponsive"
                  id="report-reason-2"
                />
                <Label htmlFor="report-reason-2">Host Unresponsive</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="payment_issue" id="report-reason-3" />
                <Label htmlFor="report-reason-3">Payment Issue</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="other" id="report-reason-4" />
                <Label htmlFor="report-reason-4">Other</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Details</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the issue"
              rows={4}
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton />
          <Button type="button" disabled={!reason || !details}>
            Submit Report
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// --- Dispute Reservation Dialog ---
function DisputeReservationDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState("");
  const [explanation, setExplanation] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Open Dispute</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Dispute Type</Label>
            <RadioGroup
              value={type}
              onValueChange={setType}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="refund" id="dispute-type-1" />
                <Label htmlFor="dispute-type-1">Refund</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="service_issue" id="dispute-type-2" />
                <Label htmlFor="dispute-type-2">Service Issue</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="other" id="dispute-type-3" />
                <Label htmlFor="dispute-type-3">Other</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Explanation</Label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain your dispute"
              rows={4}
            />
          </div>
          <div>
            <Label>Upload Images</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt={`dispute-upload-${idx}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton />
          <Button type="button" disabled={!type || !explanation}>
            Submit Dispute
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function ScanQRCodeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div>QR Code Scanner UI goes here.</div>
        <DialogClose asChild>
          <Button onClick={onClose}>Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export function ReservationDetailsContent({
  reservation,
}: ReservationDetailsContentProps) {
  const { payment, loading, error, verifyPaymentStatus, retryPayment } =
    usePayment({
      relatedId: reservation.id,
      relatedType: "reservation",
      autoFetch: true,
    });
  const { toast } = useToast();
  const [showReschedule, setShowReschedule] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showScanQR, setShowScanQR] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: price.currency || "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price.amount / 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Main Card Content */}
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            {payment.property?.backdrop && (
              <div className="w-full md:w-80 h-64 md:h-56">
                <img
                  src={payment.property.backdrop}
                  alt="Property"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 p-6 items-center justify-ChatCenteredDotsIcon">
              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {payment.property?.title || "Untitled Property"}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1 text-gray-600 mb-4">
                <MapPinIcon className="w-4 h-4" />
                <span className="text-sm">
                  {payment.property?.location?.address ||
                    "Address not available"}
                </span>
              </div>

              {/* Price and Main Specs */}
              <div className="flex flex-col flex-wrap gap-4 mb-4">
                {/* Price */}
                {payment.property?.price && (
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(payment.property.price)}
                    </p>
                    {payment.property.price?.term && (
                      <p className="text-xs text-gray-500 font-semibold mt-1">
                        /{capitalize(payment.property.price.term)}
                      </p>
                    )}
                  </div>
                )}

                {/* Main specs */}
                {payment.property?.specification && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-1 text-gray-700">
                      <BedIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {payment.property.specification.bedrooms} Beds
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-700">
                      <BathtubIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {payment.property.specification.bathrooms} Baths
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-700">
                      <RulerIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {payment.property.specification.area}{" "}
                        {payment.property.specification.area_unit}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Additional Specifications */}
          {payment.property?.specification && (
            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CarIcon className="w-4 h-4" />
                  <span>{payment.property.specification.garages} Garage</span>
                </div>

                <div className="flex items-center gap-1">
                  <LetterCirclePIcon className="w-4 h-4" />
                  <span>{payment.property.specification.parking} Parking</span>
                </div>

                <div className="flex items-center gap-1">
                  <StackIcon className="w-4 h-4" />
                  <span>{payment.property.specification.floors} Floors</span>
                </div>

                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Built {payment.property.specification.year_built}</span>
                </div>

                <div className="flex items-center gap-1">
                  <ChairIcon className="w-4 h-4" />
                  <span>
                    {payment.property.specification.is_furnished
                      ? "Furnished"
                      : "Unfurnished"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <ToiletIcon className="w-4 h-4" />
                  <span>{payment.property.specification.toilets} Toilets</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-medium">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <CoordinatesDirectionsButton
            lat={reservation.property.location.coordinates.lat}
            lng={reservation.property.location.coordinates.lng}
            children
            variant="outline"
            size="sm"
            icon={<PathIcon size={16} className={"fill-current"} />}
          />

          <Button variant="outline" size="sm">
            <ShareIcon size={16} />
          </Button>
          <Button variant="outline" size="sm">
            <ChatCenteredDotsIcon size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReschedule(true)}
          >
            <CalendarIcon size={16} /> Reschedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReport(true)}
          >
            <WarningIcon size={16} /> Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDispute(true)}
          >
            <ChatCenteredDotsIcon size={16} /> Dispute
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScanQR(true)}
          >
            {/* Use a QR code icon from your icon set, or a placeholder */}
            <span className="inline-block w-4 h-4 bg-gray-300 rounded" /> Scan
            QR
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

      {/* Dialogs */}
      <RescheduleReservationDialog
        open={showReschedule}
        onClose={() => setShowReschedule(false)}
      />
      <ReportReservationDialog
        open={showReport}
        onClose={() => setShowReport(false)}
      />
      <DisputeReservationDialog
        open={showDispute}
        onClose={() => setShowDispute(false)}
      />
      <ScanQRCodeDialog
        open={showScanQR}
        onClose={() => setShowScanQR(false)}
      />
    </div>
  );
}
