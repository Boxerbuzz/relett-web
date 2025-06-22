
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MessageSquare, Video, MapPin } from 'lucide-react';

interface InspectionDetailsContentProps {
  inspection: any;
  onStatusUpdate?: (id: string, status: string) => void;
}

export function InspectionDetailsContent({ inspection, onStatusUpdate }: InspectionDetailsContentProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(inspection.id, newStatus);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'virtual':
        return <Video className="w-4 h-4 text-muted-foreground" />;
      case 'physical':
        return <MapPin className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionButtons = () => {
    switch (inspection.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleStatusUpdate('confirmed')}
              size="sm"
            >
              Confirm Inspection
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleStatusUpdate('rescheduled')}
              size="sm"
            >
              Reschedule
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusUpdate('cancelled')}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        );
      case 'confirmed':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleStatusUpdate('completed')}
              size="sm"
            >
              Mark as Completed
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleStatusUpdate('rescheduled')}
              size="sm"
            >
              Reschedule
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusUpdate('cancelled')}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        );
      case 'rescheduled':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleStatusUpdate('confirmed')}
              size="sm"
            >
              Confirm New Time
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusUpdate('cancelled')}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Inspection Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Scheduled Time</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{formatDateTime(inspection.when)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Inspection Mode</label>
              <div className="flex items-center gap-2">
                {getModeIcon(inspection.mode)}
                <p className="font-medium capitalize">{inspection.mode}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Details */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge className="capitalize">{inspection.status}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Requested On</label>
              <p className="font-medium">{formatDateTime(inspection.created_at)}</p>
            </div>
          </div>

          {inspection.notes && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Inspector Notes</label>
                <div className="bg-muted p-3 rounded-lg mt-2">
                  <p className="text-sm">{inspection.notes}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Inspection Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Ensure all areas of the property are accessible</p>
            <p>• Have property documents ready for review</p>
            <p>• Be available to answer questions about the property</p>
            {inspection.mode === 'virtual' && (
              <p>• Ensure good internet connection for video call</p>
            )}
            {inspection.mode === 'physical' && (
              <p>• Be present at the property during inspection</p>
            )}
          </div>
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
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Inspector
            </Button>
            {inspection.mode === 'virtual' && inspection.status === 'confirmed' && (
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4 mr-2" />
                Join Video Call
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
