
import { Badge } from "@/components/ui/badge";

interface TokenStatusBadgeProps {
  status: string;
}

export function TokenStatusBadge({ status }: TokenStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', className: 'bg-gray-100 text-gray-800' };
      case 'pending_approval':
        return { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { label: 'Approved', className: 'bg-green-100 text-green-800' };
      case 'minted':
        return { label: 'Minted', className: 'bg-blue-100 text-blue-800' };
      case 'active':
        return { label: 'Active', className: 'bg-green-100 text-green-800' };
      case 'paused':
        return { label: 'Paused', className: 'bg-orange-100 text-orange-800' };
      case 'retired':
        return { label: 'Retired', className: 'bg-red-100 text-red-800' };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}
