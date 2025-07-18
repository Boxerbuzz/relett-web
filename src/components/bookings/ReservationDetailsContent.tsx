import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  DollarSign,
  MessageSquare,
  Clock,
} from "lucide-react";

interface ReservationDetailsContentProps {
  reservation: any;
  onStatusUpdate?: (id: string, status: string) => void;
}

export function ReservationDetailsContent({
  reservation,
  onStatusUpdate,
}: ReservationDetailsContentProps) {
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

  const getActionButtons = () => {
    switch (reservation.status) {
      case "pending":
        return (
          <div className="flex gap-2">
            <Button onClick={() => handleStatusUpdate("confirmed")} size="sm">
              Confirm Reservation
            </Button>
            <Button
              variant="destructive"
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
            <Button onClick={() => handleStatusUpdate("active")} size="sm">
              Check-in Guest
            </Button>
            <Button
              variant="destructive"
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

  return (
    <div className="space-y-6">
      {/* Reservation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Reservation Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Check-in
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">
                  {formatDate(reservation.from_date)}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Check-out
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{formatDate(reservation.to_date)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Duration
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{reservation.nights || 0} nights</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Information */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Adults
              </label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{reservation.adults || 0}</p>
              </div>
            </div>
            {reservation.children > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Children
                </label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{reservation.children}</p>
                </div>
              </div>
            )}
            {reservation.infants > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Infants
                </label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{reservation.infants}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      {reservation.total && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Total Amount
              </span>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">
                  {formatCurrency(reservation.total)}
                </span>
              </div>
            </div>
            {reservation.fee && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Service Fee
                </span>
                <span className="font-medium">
                  {formatCurrency(reservation.fee)}
                </span>
              </div>
            )}
            {reservation.caution_deposit && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Caution Deposit
                </span>
                <span className="font-medium">
                  {formatCurrency(reservation.caution_deposit)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getActionButtons()}
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
