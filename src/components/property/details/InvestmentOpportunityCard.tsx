import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CurrencyExchangeWidget } from "@/components/ui/currency-exchange-widget";

interface InvestmentOpportunityCardProps {
  tokenizedProperty: {
    token_price: number;
    expected_roi: number;
    minimum_investment: number;
    total_supply: string;
  };
}

export function InvestmentOpportunityCard({ tokenizedProperty }: InvestmentOpportunityCardProps) {
  if (!tokenizedProperty) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Opportunity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Token Price</p>
            <CurrencyExchangeWidget 
              amount={tokenizedProperty.token_price}
              size="sm"
              className="font-medium"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600">Expected ROI</p>
            <p className="font-bold text-green-600">{tokenizedProperty.expected_roi}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Min Investment</p>
            <CurrencyExchangeWidget 
              amount={tokenizedProperty.minimum_investment}
              size="sm"
              className="font-medium"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Supply</p>
            <p className="font-bold">{tokenizedProperty.total_supply}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 