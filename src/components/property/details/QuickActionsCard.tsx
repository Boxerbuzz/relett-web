import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { CurrencyDollarIcon } from "@phosphor-icons/react";

interface QuickActionsCardProps {
  isTokenized: boolean;
  tokenizedProperty?: { id: string };
  actions: Array<{ label: string; action: () => void; primary?: boolean }>;
  isActionDisabled: (type: string) => boolean;
  onInvestClick: () => void;
}

export function QuickActionsCard({
  isTokenized,
  tokenizedProperty,
  actions,
  isActionDisabled,
  onInvestClick,
}: QuickActionsCardProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Investment Section */}
        {isTokenized && tokenizedProperty?.id && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
              <Badge className="bg-blue-500">Tokenized</Badge>
            </div>
            <Button
              onClick={onInvestClick}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              Invest Now
            </Button>
          </div>
        )}
        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action, index) => (
              <SheetTrigger asChild key={index}>
                <Button
                  variant={action.primary ? "default" : "outline"}
                  onClick={action.action}
                  className="w-full"
                  size="lg"
                  disabled={isActionDisabled(
                    action.label.toLowerCase().includes("inspection")
                      ? "inspection"
                      : action.label.toLowerCase().includes("rent")
                      ? "rental"
                      : action.label.toLowerCase().includes("reserve")
                      ? "reservation"
                      : ""
                  )}
                >
                  {action.label}
                </Button>
              </SheetTrigger>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 