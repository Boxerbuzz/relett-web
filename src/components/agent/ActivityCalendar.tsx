
import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Eye, Home, Users } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

interface Activity {
  id: string;
  type: 'inspection' | 'rental' | 'reservation';
  title: string;
  date: string;
  status: string;
  property?: any;
  user?: any;
}

interface ActivityCalendarProps {
  inspections: any[];
  rentals: any[];
  reservations: any[];
}

export function ActivityCalendar({ inspections, rentals, reservations }: ActivityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const activities = useMemo(() => {
    const allActivities: Activity[] = [];

    inspections.forEach(inspection => {
      if (inspection.when) {
        allActivities.push({
          id: inspection.id,
          type: 'inspection',
          title: `Inspection - ${inspection.property?.title || 'Property'}`,
          date: inspection.when,
          status: inspection.status,
          property: inspection.property,
          user: inspection.user,
        });
      }
    });

    rentals.forEach(rental => {
      if (rental.move_in_date) {
        allActivities.push({
          id: rental.id,
          type: 'rental',
          title: `Move-in - ${rental.property?.title || 'Property'}`,
          date: rental.move_in_date,
          status: rental.status,
          property: rental.property,
          user: rental.user,
        });
      }
    });

    reservations.forEach(reservation => {
      if (reservation.from_date) {
        allActivities.push({
          id: reservation.id,
          type: 'reservation',
          title: `Check-in - ${reservation.property?.title || 'Property'}`,
          date: reservation.from_date,
          status: reservation.status,
          property: reservation.property,
          user: reservation.user,
        });
      }
      if (reservation.to_date) {
        allActivities.push({
          id: `${reservation.id}-checkout`,
          type: 'reservation',
          title: `Check-out - ${reservation.property?.title || 'Property'}`,
          date: reservation.to_date,
          status: reservation.status,
          property: reservation.property,
          user: reservation.user,
        });
      }
    });

    return allActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [inspections, rentals, reservations]);

  const activitiesForSelectedDate = activities.filter(activity =>
    isSameDay(parseISO(activity.date), selectedDate)
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'inspection':
        return <Eye className="h-4 w-4" />;
      case 'rental':
        return <Home className="h-4 w-4" />;
      case 'reservation':
        return <Users className="h-4 w-4" />;
      default:
        return <CalendarDays className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const daysWithActivities = activities.map(activity => parseISO(activity.date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Activity Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={{
              hasActivity: daysWithActivities,
            }}
            modifiersStyles={{
              hasActivity: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'white',
                fontWeight: 'bold',
              },
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Activities for {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesForSelectedDate.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No activities scheduled for this date
            </p>
          ) : (
            <div className="space-y-3">
              {activitiesForSelectedDate.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(activity.date), 'h:mm a')}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-muted-foreground">
                        Client: {activity.user.first_name} {activity.user.last_name}
                      </p>
                    )}
                  </div>
                  <Badge variant={getStatusColor(activity.status)} className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
