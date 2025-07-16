import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  EyeIcon,
  HouseIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useAgentInspections } from "@/hooks/useAgentInspections";
import { useAgentRentals } from "@/hooks/useAgentRentals";
import { useAgentReservations } from "@/hooks/useAgentReservations";
import { ActivityCalendar } from "@/components/agent/ActivityCalendar";
import { LoadingSpinner } from "@/components/loading/LoadingSpinner";

const AgentCalendar = () => {
  const { inspections, isLoading: inspectionsLoading } = useAgentInspections();
  const { rentals, isLoading: rentalsLoading } = useAgentRentals();
  const { reservations, isLoading: reservationsLoading } =
    useAgentReservations();

  const isLoading = inspectionsLoading || rentalsLoading || reservationsLoading;

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading calendar..." />;
  }

  const getTotalActivities = () => {
    const inspectionCount = inspections.filter((i) => i.when).length;
    const rentalCount = rentals.filter((r) => r.move_in_date).length;
    const reservationCount = reservations.filter(
      (r) => r.from_date || r.to_date
    ).length;
    return inspectionCount + rentalCount + reservationCount;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Agent Calendar</h1>
            <p className="text-muted-foreground">
              Manage all your activities in one place
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Activities
                </p>
                <p className="text-2xl font-bold">{getTotalActivities()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Inspections</p>
                <p className="text-2xl font-bold">
                  {inspections.filter((i) => i.when).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HouseIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Rentals</p>
                <p className="text-2xl font-bold">
                  {rentals.filter((r) => r.move_in_date).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Reservations</p>
                <p className="text-2xl font-bold">
                  {reservations.filter((r) => r.from_date || r.to_date).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <ActivityCalendar
            inspections={inspections}
            rentals={rentals}
            reservations={reservations}
          />
        </TabsContent>

        <TabsContent value="list">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EyeIcon className="h-5 w-5 text-blue-600" />
                  Upcoming Inspections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inspections
                  .filter((i) => i.when && new Date(i.when) > new Date())
                  .slice(0, 5)
                  .map((inspection) => (
                    <div
                      key={inspection.id}
                      className="mb-3 p-3 border rounded-lg"
                    >
                      <h4 className="font-medium text-sm">
                        {inspection.property?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inspection.when || "").toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(inspection.when || "").toLocaleTimeString()}
                      </p>
                      <p className="text-xs">
                        {inspection.user?.first_name}{" "}
                        {inspection.user?.last_name}
                      </p>
                    </div>
                  ))}
                {inspections.filter(
                  (i) => i.when && new Date(i.when) > new Date()
                ).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No upcoming inspections
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HouseIcon className="h-5 w-5 text-green-600" />
                  Upcoming Move-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rentals
                  .filter(
                    (r) =>
                      r.move_in_date && new Date(r.move_in_date) > new Date()
                  )
                  .slice(0, 5)
                  .map((rental) => (
                    <div key={rental.id} className="mb-3 p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">
                        {rental.property?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Move-in:{" "}
                        {new Date(
                          rental.move_in_date || ""
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        {rental.user?.first_name} {rental.user?.last_name}
                      </p>
                    </div>
                  ))}
                {rentals.filter(
                  (r) => r.move_in_date && new Date(r.move_in_date) > new Date()
                ).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No upcoming move-ins
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-purple-600" />
                  Upcoming Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reservations
                  .filter(
                    (r) => r.from_date && new Date(r.from_date) > new Date()
                  )
                  .slice(0, 5)
                  .map((reservation) => (
                    <div
                      key={reservation.id}
                      className="mb-3 p-3 border rounded-lg"
                    >
                      <h4 className="font-medium text-sm">
                        {reservation.property?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Check-in:{" "}
                        {new Date(
                          reservation.from_date || ""
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        {reservation.user?.first_name}{" "}
                        {reservation.user?.last_name}
                      </p>
                    </div>
                  ))}
                {reservations.filter(
                  (r) => r.from_date && new Date(r.from_date) > new Date()
                ).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No upcoming check-ins
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentCalendar;
