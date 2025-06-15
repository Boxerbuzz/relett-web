
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Key, Link, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Database schema data based on your actual database
const databaseTables = {
  // Core User Management
  users: {
    description: "Core user profiles and authentication data",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'email', type: 'text', nullable: false },
      { name: 'first_name', type: 'text', nullable: false },
      { name: 'last_name', type: 'text', nullable: false },
      { name: 'full_name', type: 'text', nullable: true },
      { name: 'phone', type: 'text', nullable: true },
      { name: 'avatar', type: 'text', nullable: true },
      { name: 'bio', type: 'text', nullable: true },
      { name: 'user_type', type: 'text', nullable: false, default: 'landowner' },
      { name: 'verification_status', type: 'verification_status', nullable: true },
      { name: 'is_active', type: 'boolean', nullable: true, default: true },
      { name: 'is_verified', type: 'boolean', nullable: true, default: false },
      { name: 'has_setup', type: 'boolean', nullable: true, default: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true }
    ],
    relationships: []
  },
  
  user_roles: {
    description: "Role assignments for users",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'role', type: 'app_role', nullable: false },
      { name: 'is_active', type: 'boolean', nullable: true, default: true },
      { name: 'expires_at', type: 'timestamp with time zone', nullable: true },
      { name: 'assigned_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'assigned_by', type: 'uuid', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  user_profiles: {
    description: "Extended user profile information",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'middle_name', type: 'text', nullable: true },
      { name: 'date_of_birth', type: 'text', nullable: true },
      { name: 'gender', type: 'text', nullable: true },
      { name: 'address', type: 'jsonb', nullable: true },
      { name: 'nationality', type: 'text', nullable: true },
      { name: 'state_of_origin', type: 'text', nullable: true },
      { name: 'lga', type: 'text', nullable: true },
      { name: 'last_login', type: 'text', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'one-to-one' }
    ]
  },

  // Property Management
  properties: {
    description: "Main property listings with details, pricing, location",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'title', type: 'text', nullable: true },
      { name: 'description', type: 'text', nullable: true },
      { name: 'category', type: 'text', nullable: false },
      { name: 'type', type: 'text', nullable: false },
      { name: 'status', type: 'text', nullable: false },
      { name: 'price', type: 'jsonb', nullable: false },
      { name: 'location', type: 'jsonb', nullable: false },
      { name: 'specification', type: 'jsonb', nullable: false },
      { name: 'amenities', type: 'text[]', nullable: true },
      { name: 'features', type: 'text[]', nullable: true },
      { name: 'condition', type: 'text', nullable: true },
      { name: 'year_built', type: 'text', nullable: true },
      { name: 'sqrft', type: 'text', nullable: true },
      { name: 'garages', type: 'integer', nullable: true },
      { name: 'max_guest', type: 'integer', nullable: true },
      { name: 'backdrop', type: 'text', nullable: true },
      { name: 'documents', type: 'jsonb', nullable: true },
      { name: 'tags', type: 'text[]', nullable: true },
      { name: 'views', type: 'integer', nullable: true, default: 0 },
      { name: 'likes', type: 'integer', nullable: true, default: 0 },
      { name: 'favorites', type: 'integer', nullable: true, default: 0 },
      { name: 'ratings', type: 'integer', nullable: true, default: 0 },
      { name: 'review_count', type: 'integer', nullable: true, default: 0 },
      { name: 'is_featured', type: 'boolean', nullable: true, default: false },
      { name: 'is_verified', type: 'boolean', nullable: true, default: false },
      { name: 'is_tokenized', type: 'boolean', nullable: true, default: false },
      { name: 'is_ad', type: 'boolean', nullable: true, default: false },
      { name: 'is_deleted', type: 'boolean', nullable: true, default: false },
      { name: 'is_exclusive', type: 'boolean', nullable: true, default: false },
      { name: 'land_title_id', type: 'uuid', nullable: true, foreignKey: 'land_titles.id' },
      { name: 'tokenized_property_id', type: 'uuid', nullable: true, foreignKey: 'tokenized_properties.id' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'land_titles', field: 'land_title_id', references: 'id', type: 'many-to-one' },
      { table: 'tokenized_properties', field: 'tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  property_images: {
    description: "Property photos and media",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'url', type: 'text', nullable: false },
      { name: 'thumbnail_url', type: 'text', nullable: true },
      { name: 'category', type: 'text', nullable: true },
      { name: 'is_primary', type: 'boolean', nullable: true, default: false },
      { name: 'sort_order', type: 'integer', nullable: true },
      { name: 'ratio', type: 'numeric', nullable: true }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Land Registry & Legal
  land_titles: {
    description: "Official land ownership records",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'title_number', type: 'text', nullable: false },
      { name: 'owner_id', type: 'uuid', nullable: false },
      { name: 'coordinates', type: 'jsonb', nullable: false },
      { name: 'area_sqm', type: 'numeric', nullable: false },
      { name: 'description', type: 'text', nullable: false },
      { name: 'location_address', type: 'text', nullable: false },
      { name: 'state', type: 'text', nullable: false },
      { name: 'lga', type: 'text', nullable: false },
      { name: 'land_use', type: 'text', nullable: false },
      { name: 'title_type', type: 'text', nullable: false },
      { name: 'acquisition_date', type: 'date', nullable: false },
      { name: 'acquisition_method', type: 'text', nullable: false },
      { name: 'previous_title_id', type: 'uuid', nullable: true, foreignKey: 'land_titles.id' },
      { name: 'status', type: 'land_title_status', nullable: true, default: 'draft' },
      { name: 'blockchain_hash', type: 'text', nullable: true },
      { name: 'blockchain_transaction_id', type: 'text', nullable: true },
      { name: 'verification_metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'land_titles', field: 'previous_title_id', references: 'id', type: 'self-reference' }
    ]
  },

  // Tokenization & Investment
  tokenized_properties: {
    description: "Properties converted to digital tokens",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'land_title_id', type: 'uuid', nullable: false, foreignKey: 'land_titles.id' },
      { name: 'property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'token_symbol', type: 'text', nullable: false },
      { name: 'token_name', type: 'text', nullable: false },
      { name: 'token_type', type: 'token_type', nullable: false },
      { name: 'total_supply', type: 'text', nullable: false },
      { name: 'total_value_usd', type: 'numeric', nullable: false },
      { name: 'minimum_investment', type: 'numeric', nullable: false },
      { name: 'token_price', type: 'numeric', nullable: false },
      { name: 'status', type: 'tokenization_status', nullable: true, default: 'draft' },
      { name: 'blockchain_network', type: 'text', nullable: false },
      { name: 'token_contract_address', type: 'text', nullable: true },
      { name: 'token_id', type: 'text', nullable: true },
      { name: 'hedera_token_id', type: 'text', nullable: true },
      { name: 'investment_terms', type: 'investment_terms', nullable: false },
      { name: 'expected_roi', type: 'numeric', nullable: false },
      { name: 'revenue_distribution_frequency', type: 'text', nullable: false },
      { name: 'lock_up_period_months', type: 'integer', nullable: false },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'legal_structure', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'land_titles', field: 'land_title_id', references: 'id', type: 'many-to-one' },
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  token_holdings: {
    description: "Individual investor token ownership",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'tokenized_property_id', type: 'uuid', nullable: false, foreignKey: 'tokenized_properties.id' },
      { name: 'holder_id', type: 'uuid', nullable: false },
      { name: 'tokens_owned', type: 'text', nullable: false },
      { name: 'purchase_price_per_token', type: 'numeric', nullable: false },
      { name: 'total_investment', type: 'numeric', nullable: false },
      { name: 'acquisition_date', type: 'date', nullable: false },
      { name: 'vesting_schedule', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'tokenized_properties', field: 'tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Financial Systems
  accounts: {
    description: "User wallet balances and points",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'type', type: 'text', nullable: false },
      { name: 'amount', type: 'bigint', nullable: false, default: 0 },
      { name: 'points', type: 'bigint', nullable: false, default: 0 },
      { name: 'currency', type: 'text', nullable: false, default: 'NGN' },
      { name: 'status', type: 'text', nullable: false, default: 'active' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  payments: {
    description: "Transaction records",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'agent_id', type: 'uuid', nullable: true, foreignKey: 'users.id' },
      { name: 'property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'amount', type: 'bigint', nullable: false },
      { name: 'currency', type: 'text', nullable: true, default: 'NGN' },
      { name: 'type', type: 'text', nullable: true, default: 'initial' },
      { name: 'method', type: 'text', nullable: true, default: 'card' },
      { name: 'provider', type: 'text', nullable: true, default: 'paystack' },
      { name: 'status', type: 'text', nullable: true, default: 'pending' },
      { name: 'reference', type: 'text', nullable: false },
      { name: 'related_id', type: 'uuid', nullable: false },
      { name: 'related_type', type: 'text', nullable: false },
      { name: 'link', type: 'text', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'paid_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp without time zone', nullable: true, default: 'now()' },
      { name: 'updated_at', type: 'timestamp without time zone', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'agent_id', references: 'id', type: 'many-to-one' },
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Communication
  conversations: {
    description: "Chat rooms and groups",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'name', type: 'text', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'type', type: 'text', nullable: false },
      { name: 'admin_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'participants', type: 'uuid[]', nullable: false },
      { name: 'activity_type', type: 'activity_type', nullable: true },
      { name: 'avatar_url', type: 'text', nullable: true },
      { name: 'is_archived', type: 'boolean', nullable: false, default: false },
      { name: 'settings', type: 'jsonb', nullable: false },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'admin_id', references: 'id', type: 'many-to-one' }
    ]
  },

  messages: {
    description: "Individual chat messages",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'conversation_id', type: 'uuid', nullable: false, foreignKey: 'conversations.id' },
      { name: 'sender_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'sender', type: 'text', nullable: false },
      { name: 'content', type: 'text', nullable: false },
      { name: 'type', type: 'text', nullable: false },
      { name: 'reply_to_id', type: 'uuid', nullable: true, foreignKey: 'messages.id' },
      { name: 'property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'attachment_id', type: 'uuid', nullable: true, foreignKey: 'message_attachments.id' },
      { name: 'properties', type: 'jsonb', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'reactions', type: 'jsonb', nullable: false, default: '{}' },
      { name: 'read_by', type: 'uuid[]', nullable: false, default: '{}' },
      { name: 'is_edited', type: 'boolean', nullable: false, default: false },
      { name: 'is_deleted', type: 'boolean', nullable: false, default: false },
      { name: 'error_message', type: 'text', nullable: true },
      { name: 'timestamp', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'conversations', field: 'conversation_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'sender_id', references: 'id', type: 'many-to-one' },
      { table: 'messages', field: 'reply_to_id', references: 'id', type: 'self-reference' },
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'message_attachments', field: 'attachment_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Notifications
  notifications: {
    description: "All user notifications",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'sender_id', type: 'uuid', nullable: true, foreignKey: 'users.id' },
      { name: 'type', type: 'notification_type', nullable: false },
      { name: 'title', type: 'text', nullable: false },
      { name: 'message', type: 'text', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: false, default: '{}' },
      { name: 'action_url', type: 'text', nullable: true },
      { name: 'action_label', type: 'text', nullable: true },
      { name: 'image_url', type: 'text', nullable: true },
      { name: 'is_read', type: 'boolean', nullable: false, default: false },
      { name: 'action_taken_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'sender_id', references: 'id', type: 'many-to-one' }
    ]
  }
};

const DatabaseSchema = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showRelationships, setShowRelationships] = useState(true);

  const filteredTables = Object.entries(databaseTables).filter(([tableName]) =>
    tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    if (type.includes('uuid')) return 'bg-blue-100 text-blue-800';
    if (type.includes('text')) return 'bg-green-100 text-green-800';
    if (type.includes('integer') || type.includes('bigint') || type.includes('numeric')) return 'bg-orange-100 text-orange-800';
    if (type.includes('boolean')) return 'bg-purple-100 text-purple-800';
    if (type.includes('timestamp')) return 'bg-red-100 text-red-800';
    if (type.includes('jsonb')) return 'bg-yellow-100 text-yellow-800';
    if (type.includes('[]')) return 'bg-cyan-100 text-cyan-800';
    return 'bg-gray-100 text-gray-800';
  };

  const renderTableCard = (tableName: string, tableData: any) => (
    <Card key={tableName} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5" />
            {tableName}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTable(selectedTable === tableName ? null : tableName)}
          >
            {selectedTable === tableName ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{tableData.description}</p>
      </CardHeader>
      
      {selectedTable === tableName && (
        <CardContent>
          <div className="space-y-4">
            {/* Fields Table */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Fields ({tableData.fields.length})
              </h4>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Nullable</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Constraints</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.fields.map((field: any) => (
                      <TableRow key={field.name}>
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-2">
                            {field.name}
                            {field.primary && <Badge variant="secondary" className="text-xs">PK</Badge>}
                            {field.foreignKey && <Badge variant="outline" className="text-xs">FK</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(field.type)}>
                            {field.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={field.nullable ? "secondary" : "destructive"}>
                            {field.nullable ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {field.default || '-'}
                        </TableCell>
                        <TableCell>
                          {field.foreignKey && (
                            <Badge variant="outline" className="text-xs">
                              → {field.foreignKey}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Relationships */}
            {showRelationships && tableData.relationships.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Relationships ({tableData.relationships.length})
                </h4>
                <div className="space-y-2">
                  {tableData.relationships.map((rel: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge variant="outline">{rel.type}</Badge>
                      <span className="font-mono text-sm">
                        {tableName}.{rel.field} → {rel.table}.{rel.references}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/database-docs')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Database Docs
            </Button>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">Database Schema</h1>
              <p className="text-sm text-gray-600">Interactive table relationships and field definitions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRelationships(!showRelationships)}
              className="flex items-center gap-2"
            >
              <Link className="w-4 h-4" />
              {showRelationships ? 'Hide' : 'Show'} Relationships
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search and Stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredTables.length} of {Object.keys(databaseTables).length} tables
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{Object.keys(databaseTables).length}</div>
              <div className="text-sm text-muted-foreground">Total Tables</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {Object.values(databaseTables).reduce((acc, table) => acc + table.fields.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Fields</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {Object.values(databaseTables).reduce((acc, table) => acc + table.relationships.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Relationships</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {Object.values(databaseTables).reduce((acc, table) => 
                  acc + table.fields.filter((f: any) => f.foreignKey).length, 0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Foreign Keys</div>
            </CardContent>
          </Card>
        </div>

        {/* Tables List */}
        <div className="space-y-4">
          {filteredTables.map(([tableName, tableData]) => renderTableCard(tableName, tableData))}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No tables found</h3>
            <p className="text-muted-foreground">Try adjusting your search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseSchema;
