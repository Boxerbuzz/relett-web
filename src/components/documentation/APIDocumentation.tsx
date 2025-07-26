import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CodeIcon,
  CopyIcon,
  LinkIcon,
  KeyIcon,
  DatabaseIcon,
  LightningIcon,
  HardDrivesIcon,
} from "@phosphor-icons/react";
import { toast } from "@/hooks/use-toast";

export function APIDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState("properties");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet has been copied to your clipboard.",
    });
  };

  const endpoints = {
    properties: {
      title: "Properties API",
      description: "Manage property listings and tokenization",
      endpoints: [
        {
          method: "GET",
          path: "/api/properties",
          description: "Retrieve all properties",
          params: [
            {
              name: "page",
              type: "number",
              required: false,
              description: "Page number for pagination",
            },
            {
              name: "limit",
              type: "number",
              required: false,
              description: "Number of items per page",
            },
            {
              name: "status",
              type: "string",
              required: false,
              description: "Filter by property status",
            },
          ],
          response: `{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Modern Apartment Complex",
      "description": "Luxury apartment complex in downtown area",
      "price": 2500000,
      "location": "Downtown District",
      "property_type": "apartment",
      "status": "active",
      "is_tokenized": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}`,
        },
        {
          method: "POST",
          path: "/api/properties",
          description: "Create a new property listing",
          body: `{
  "title": "Modern Apartment Complex",
  "description": "Luxury apartment complex in downtown area",
  "price": 2500000,
  "location": "Downtown District",
  "property_type": "apartment",
  "bedrooms": 3,
  "bathrooms": 2,
  "square_footage": 1200,
  "amenities": ["pool", "gym", "parking"],
  "images": ["https://example.com/image1.jpg"]
}`,
          response: `{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Modern Apartment Complex",
    "status": "pending_verification"
  }
}`,
        },
      ],
    },
    tokens: {
      title: "Tokens API",
      description: "Handle token operations and transfers",
      endpoints: [
        {
          method: "POST",
          path: "/api/tokens/transfer",
          description: "Transfer tokens between accounts",
          body: `{
  "tokenId": "0.0.12345",
  "fromAccountId": "0.0.1001",
  "toAccountId": "0.0.1002",
  "amount": 100,
  "memo": "Property token transfer"
}`,
          response: `{
  "success": true,
  "transactionId": "0.0.12345@1234567890.123456789",
  "status": "pending"
}`,
        },
        {
          method: "GET",
          path: "/api/tokens/holdings/:userId",
          description: "Get token holdings for a user",
          response: `{
  "data": [
    {
      "tokenized_property_id": "123e4567-e89b-12d3-a456-426614174000",
      "tokens_owned": 50,
      "total_investment": 125000,
      "current_value": 135000,
      "property_title": "Modern Apartment Complex"
    }
  ]
}`,
        },
      ],
    },
    trading: {
      title: "Trading API",
      description: "Execute trades and manage orders",
      endpoints: [
        {
          method: "POST",
          path: "/api/trading/orders",
          description: "Place a trading order",
          body: `{
  "tokenizedPropertyId": "123e4567-e89b-12d3-a456-426614174000",
  "orderType": "limit",
  "tradeType": "buy",
  "tokenAmount": 10,
  "pricePerToken": 2500
}`,
          response: `{
  "success": true,
  "orderId": "order_123456",
  "status": "pending",
  "estimatedTotal": 25000
}`,
        },
        {
          method: "GET",
          path: "/api/trading/orderbook/:propertyId",
          description: "Get order book for a property",
          response: `{
  "buy_orders": [
    {
      "price": 2450,
      "size": 20,
      "total": 49000,
      "depth": 20
    }
  ],
  "sell_orders": [
    {
      "price": 2550,
      "size": 15,
      "total": 38250,
      "depth": 15
    }
  ]
}`,
        },
      ],
    },
    governance: {
      title: "Governance API",
      description: "Voting and proposal management",
      endpoints: [
        {
          method: "POST",
          path: "/api/governance/polls",
          description: "Create a new poll",
          body: `{
  "title": "Property Renovation Proposal",
  "description": "Upgrade building facade and lobby",
  "investment_group_id": "123e4567-e89b-12d3-a456-426614174000",
  "voting_power_basis": "tokens",
  "options": ["Approve", "Reject", "Modify"],
  "ends_at": "2024-02-15T23:59:59Z"
}`,
          response: `{
  "success": true,
  "pollId": "poll_123456",
  "status": "active"
}`,
        },
        {
          method: "POST",
          path: "/api/governance/vote",
          description: "Cast a vote on a poll",
          body: `{
  "pollId": "poll_123456",
  "option": "Approve",
  "votingPower": 15.5
}`,
          response: `{
  "success": true,
  "voteId": "vote_789012",
  "votingPower": 15.5
}`,
        },
      ],
    },
  };

  const CodeBlock = ({
    code,
    language = "json",
  }: {
    code: string;
    language?: string;
  }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code)}
      >
        <CopyIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  const MethodBadge = ({ method }: { method: string }) => {
    const colors = {
      GET: "bg-green-500",
      POST: "bg-blue-500",
      PUT: "bg-yellow-500",
      DELETE: "bg-red-500",
    };

    return (
      <Badge className={`${colors[method as keyof typeof colors]} text-white`}>
        {method}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          API Documentation
        </h1>
        <p className="text-muted-foreground">
          Complete reference for PropertyToken platform APIs
        </p>
      </div>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <KeyIcon className="h-5 w-5 text-primary" />
            <CardTitle>Authentication</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            All API requests require authentication using a Bearer token
            obtained from Supabase Auth.
          </p>
          <CodeBlock
            code={`curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
     -H "Content-Type: application/json" \\
     https://api.propertytoken.com/api/properties`}
          />
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">API Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(endpoints).map(([key, section]) => (
              <Button
                key={key}
                variant={selectedEndpoint === key ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedEndpoint(key)}
              >
                <HardDrivesIcon className="h-4 w-4 mr-2" />
                {section.title}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Endpoint Details */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {endpoints[selectedEndpoint as keyof typeof endpoints].title}
            </CardTitle>
            <CardDescription>
              {
                endpoints[selectedEndpoint as keyof typeof endpoints]
                  .description
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                {endpoints[
                  selectedEndpoint as keyof typeof endpoints
                ].endpoints.map((endpoint, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <MethodBadge method={endpoint.method} />
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>

                    <p className="text-muted-foreground">
                      {endpoint.description}
                    </p>

                    {endpoint.params && (
                      <div>
                        <h4 className="font-semibold mb-2">Parameters</h4>
                        <div className="space-y-2">
                          {endpoint.params.map((param, paramIndex) => (
                            <div
                              key={paramIndex}
                              className="border rounded p-3"
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <code className="text-sm font-mono">
                                  {param.name}
                                </code>
                                <Badge variant="outline">{param.type}</Badge>
                                {param.required && (
                                  <Badge variant="destructive">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {param.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {endpoint.body && (
                      <div>
                        <h4 className="font-semibold mb-2">Request Body</h4>
                        <CodeBlock code={endpoint.body} />
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <CodeBlock code={endpoint.response} />
                    </div>

                    {index <
                      endpoints[selectedEndpoint as keyof typeof endpoints]
                        .endpoints.length -
                        1 && (
                      <div className="border-t border-border my-6"></div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* SDKs and Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CodeIcon className="h-5 w-5 text-primary" />
              <CardTitle>JavaScript SDK</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Use our JavaScript SDK for easier integration with your
              applications.
            </p>
            <CodeBlock
              code={`npm install @propertytoken/sdk

import { PropertyTokenSDK } from '@propertytoken/sdk';

const sdk = new PropertyTokenSDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.propertytoken.com'
});

// Get properties
const properties = await sdk.properties.list();

// Transfer tokens
const transfer = await sdk.tokens.transfer({
  tokenId: '0.0.12345',
  toAccountId: '0.0.1002',
  amount: 100
});`}
              language="javascript"
            />
            <Button className="w-full">
              Download SDK
              <LinkIcon className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <LightningIcon className="h-5 w-5 text-primary" />
              <CardTitle>Rate Limits</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Standard API calls</span>
                <Badge>1000/hour</Badge>
              </div>
              <div className="flex justify-between">
                <span>Trading operations</span>
                <Badge>100/hour</Badge>
              </div>
              <div className="flex justify-between">
                <span>Token transfers</span>
                <Badge>50/hour</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Rate limits are per API key. Contact support for higher limits.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
