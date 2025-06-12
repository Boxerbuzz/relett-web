
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Home, MoreHorizontal, Phone, Mail, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface RentalCardProps {
  rental: any;
  onUpdateStatus: (id: string, status: string) => void;
}

export function RentalCard({ rental, onUpdateStatus }: RentalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold">{rental.property?.title || 'Rental Property'}</h3>
              <p className="text-sm text-muted-foreground">
                {rental.property?.location?.address || 'Location not specified'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdateStatus(rental.id, 'approved')}>
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(rental.id, 'active')}>
                Mark Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(rental.id, 'completed')}>
                Complete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(rental.id, 'cancelled')}>
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor(rental.status)}>
            {rental.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {rental.payment_plan}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {rental.price && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4" />
              <span>₦{rental.price.toLocaleString()}</span>
            </div>
          )}
          {rental.move_in_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(rental.move_in_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {rental.user && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Tenant Details</h4>
            <div className="space-y-1">
              <p className="text-sm">
                {rental.user.first_name} {rental.user.last_name}
              </p>
              {rental.user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{rental.user.email}</span>
                </div>
              )}
              {rental.user.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{rental.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {rental.message && (
          <div>
            <h4 className="font-medium text-sm mb-1">Message</h4>
            <p className="text-sm text-muted-foreground">{rental.message}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
