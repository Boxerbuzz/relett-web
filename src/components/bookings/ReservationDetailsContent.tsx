import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  DollarSign,
  MessageSquare,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReservationDetailsContentProps {
  reservation: any;
  agent?: { email: string; phone: string };
  payment?: { status: string; link?: string };
  onStatusUpdate?: (id: string, status: string) => void;
}

export function ReservationDetailsContent({
  reservation,
  agent,
  payment,
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

  function maskEmail(email: string) {
    if (!email) return "";
    const [user, domain] = email.split("@");
    return user[0] + "***@" + domain;
  }

  function maskPhone(phone: string) {
    if (!phone) return "";
    return phone.slice(0, 3) + "****" + phone.slice(-3);
  }

  return (
    <div className="space-y-6">
      {/* At-a-glance summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reservation Overview</CardTitle>
            <Badge variant="outline">{reservation.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Dates & Duration */}
            <div>
              <label>Check-in</label>
              <div>{formatDate(reservation.from_date)}</div>
            </div>
            <div>
              <label>Check-out</label>
              <div>{formatDate(reservation.to_date)}</div>
            </div>
            <div>
              <label>Duration</label>
              <div>{reservation.nights || 0} nights</div>
            </div>
            {/* Payment Status */}
            <div>
              <label>Payment Status</label>
              <div>
                <Badge
                  variant={
                    payment?.status === "paid" ? "default" : "destructive"
                  }
                >
                  {payment?.status || "unpaid"}
                </Badge>
                {payment?.link && payment?.status !== "paid" && (
                  <a
                    href={payment.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 underline flex items-center"
                  >
                    Pay Now <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest & Agent Details */}
      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Guest</label>
              <div>{reservation.guest_name || "N/A"}</div>
              <div>{reservation.guest_email || "N/A"}</div>
            </div>
            <div>
              <label>Agent in Charge</label>
              <div>{agent ? maskEmail(agent.email) : "N/A"}</div>
              <div>{agent ? maskPhone(agent.phone) : "N/A"}</div>
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
            <div>Total: {formatCurrency(reservation.total)}</div>
            {reservation.fee && (
              <div>Service Fee: {formatCurrency(reservation.fee)}</div>
            )}
            {reservation.caution_deposit && (
              <div>
                Caution Deposit: {formatCurrency(reservation.caution_deposit)}
              </div>
            )}
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

      {/* Actions */}
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
