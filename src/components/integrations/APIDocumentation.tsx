import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Copy, ExternalLink, Key, FileJson, Book } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  example: string;
  response: string;
}

export function APIDocumentation() {
  const { toast } = useToast();
  const [apiKey] = useState('sk_live_xxxxxxxxxxxxxxxxxxxxxxxx');

  const endpoints: APIEndpoint[] = [
    {
      method: 'GET',
      path: '/api/carts',
      description: 'Retrieve all carts for your organization',
      parameters: [
        { name: 'store_id', type: 'string', required: false, description: 'Filter by store ID' },
        { name: 'status', type: 'string', required: false, description: 'Filter by status (active, maintenance, retired)' },
        { name: 'limit', type: 'number', required: false, description: 'Number of results to return' }
      ],
      example: `curl -X GET "https://api.cartmaintenance.app/v1/carts?store_id=store_123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      response: `{
  "data": [
    {
      "id": "cart_abc123",
      "qr_code": "CART-001",
      "store_id": "store_123",
      "status": "active",
      "last_maintenance": "2025-09-15"
    }
  ],
  "total": 1
}`
    },
    {
      method: 'GET',
      path: '/api/carts/:id',
      description: 'Retrieve a specific cart by ID',
      example: `curl -X GET "https://api.cartmaintenance.app/v1/carts/cart_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      response: `{
  "id": "cart_abc123",
  "qr_code": "CART-001",
  "store_id": "store_123",
  "status": "active",
  "last_maintenance": "2025-09-15",
  "issues": [],
  "maintenance_history": []
}`
    },
    {
      method: 'POST',
      path: '/api/carts',
      description: 'Create a new cart',
      parameters: [
        { name: 'qr_code', type: 'string', required: true, description: 'Unique QR code for the cart' },
        { name: 'store_id', type: 'string', required: true, description: 'Store ID where cart is located' },
        { name: 'status', type: 'string', required: true, description: 'Initial status of the cart' }
      ],
      example: `curl -X POST "https://api.cartmaintenance.app/v1/carts" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "qr_code": "CART-002",
    "store_id": "store_123",
    "status": "active"
  }'`,
      response: `{
  "id": "cart_xyz789",
  "qr_code": "CART-002",
  "store_id": "store_123",
  "status": "active",
  "created_at": "2025-10-04T20:00:00Z"
}`
    },
    {
      method: 'PUT',
      path: '/api/carts/:id',
      description: 'Update an existing cart',
      parameters: [
        { name: 'status', type: 'string', required: false, description: 'New status for the cart' },
        { name: 'issues', type: 'array', required: false, description: 'List of current issues' }
      ],
      example: `curl -X PUT "https://api.cartmaintenance.app/v1/carts/cart_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "maintenance",
    "issues": ["Wheel damage", "Handle loose"]
  }'`,
      response: `{
  "id": "cart_abc123",
  "status": "maintenance",
  "issues": ["Wheel damage", "Handle loose"],
  "updated_at": "2025-10-04T20:00:00Z"
}`
    },
    {
      method: 'POST',
      path: '/api/maintenance-requests',
      description: 'Create a maintenance request',
      parameters: [
        { name: 'cart_id', type: 'string', required: true, description: 'ID of the cart' },
        { name: 'provider_id', type: 'string', required: true, description: 'Maintenance provider ID' },
        { name: 'priority', type: 'string', required: true, description: 'Request priority (low, medium, high)' },
        { name: 'description', type: 'string', required: false, description: 'Issue description' }
      ],
      example: `curl -X POST "https://api.cartmaintenance.app/v1/maintenance-requests" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "cart_id": "cart_abc123",
    "provider_id": "provider_123",
    "priority": "high",
    "description": "Urgent wheel repair needed"
  }'`,
      response: `{
  "id": "req_def456",
  "cart_id": "cart_abc123",
  "provider_id": "provider_123",
  "status": "pending",
  "priority": "high",
  "created_at": "2025-10-04T20:00:00Z"
}`
    },
    {
      method: 'GET',
      path: '/api/analytics',
      description: 'Retrieve analytics data',
      parameters: [
        { name: 'start_date', type: 'string', required: true, description: 'Start date (YYYY-MM-DD)' },
        { name: 'end_date', type: 'string', required: true, description: 'End date (YYYY-MM-DD)' },
        { name: 'cart_id', type: 'string', required: false, description: 'Filter by specific cart' }
      ],
      example: `curl -X GET "https://api.cartmaintenance.app/v1/analytics?start_date=2025-09-01&end_date=2025-10-01" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      response: `{
  "data": [
    {
      "date": "2025-09-15",
      "total_carts": 150,
      "active_carts": 145,
      "maintenance_cost": 2500.00,
      "downtime_minutes": 120
    }
  ]
}`
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code snippet copied to clipboard"
    });
  };

  const getMethodBadge = (method: string) => {
    const variants: Record<string, string> = {
      'GET': 'bg-blue-100 text-blue-800',
      'POST': 'bg-green-100 text-green-800',
      'PUT': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[method]}>
        {method}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Documentation</h2>
        <p className="text-muted-foreground">
          RESTful API for programmatic access to cart maintenance data
        </p>
      </div>

      {/* API Key Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            All API requests require authentication using an API key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Your API Key</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-muted rounded-md font-mono text-sm">
                {apiKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(apiKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Security Notice:</strong> Keep your API key secure and never share it publicly. 
              Rotate your keys regularly for enhanced security.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Include in Request Headers</p>
            <code className="block p-3 bg-muted rounded-md font-mono text-sm">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Tabs defaultValue="carts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="carts">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Carts
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <FileJson className="h-4 w-4 mr-2" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carts" className="space-y-4">
          {endpoints.filter(e => e.path.startsWith('/api/carts')).map((endpoint, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getMethodBadge(endpoint.method)}
                    <code className="text-sm font-mono">{endpoint.path}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(endpoint.example)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-sm">
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                            {param.name}
                          </code>
                          <span className="text-muted-foreground">{param.type}</span>
                          {param.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                          <span className="text-muted-foreground">- {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-2">Example Request</h4>
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    <code className="text-xs font-mono">{endpoint.example}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Example Response</h4>
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    <code className="text-xs font-mono">{endpoint.response}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          {endpoints.filter(e => e.path.includes('maintenance')).map((endpoint, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getMethodBadge(endpoint.method)}
                    <code className="text-sm font-mono">{endpoint.path}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(endpoint.example)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-sm">
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                            {param.name}
                          </code>
                          <span className="text-muted-foreground">{param.type}</span>
                          {param.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                          <span className="text-muted-foreground">- {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-2">Example Request</h4>
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    <code className="text-xs font-mono">{endpoint.example}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Example Response</h4>
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    <code className="text-xs font-mono">{endpoint.response}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {endpoints.filter(e => e.path.includes('analytics')).map((endpoint, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getMethodBadge(endpoint.method)}
                    <code className="text-sm font-mono">{endpoint.path}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(endpoint.example)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-sm">
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                            {param.name}
                          </code>
                          <span className="text-muted-foreground">{param.type}</span>
                          {param.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                          <span className="text-muted-foreground">- {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-2">Example Request</h4>
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    <code className="text-xs font-mono">{endpoint.example}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Example Response</h4>
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    <code className="text-xs font-mono">{endpoint.response}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Additional Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full API Reference
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Code className="h-4 w-4 mr-2" />
            Download Postman Collection
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileJson className="h-4 w-4 mr-2" />
            OpenAPI Specification (Swagger)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Missing imports
import { ShoppingCart, BarChart } from "lucide-react";
