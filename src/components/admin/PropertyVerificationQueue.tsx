
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, FileText, MapPin, User } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location: any;
  price: any;
  created_at: string;
  is_verified: boolean;
  user_id: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface PropertyDocument {
  id: string;
  property_id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  status: string;
  created_at: string;
}

export function PropertyVerificationQueue() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          users:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('is_verified', false)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyDocuments = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('property_documents')
        .select('*')
        .eq('property_id', propertyId);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const verifyProperty = async (propertyId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          is_verified: isApproved,
          status: isApproved ? 'active' : 'rejected'
        })
        .eq('id', propertyId);

      if (error) throw error;

      // Update documents status if approved
      if (isApproved && documents.length > 0) {
        const { error: docError } = await supabase
          .from('property_documents')
          .update({ status: 'verified' })
          .eq('property_id', propertyId);

        if (docError) console.error('Error updating documents:', docError);
      }

      // Remove from pending list
      setProperties(properties.filter(p => p.id !== propertyId));
      setIsReviewDialogOpen(false);
      setSelectedProperty(null);

      toast({
        title: 'Success',
        description: `Property ${isApproved ? 'approved' : 'rejected'} successfully`
      });
    } catch (error) {
      console.error('Error verifying property:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify property',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const getPriorityBadge = (createdAt: string) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated > 7) return <Badge variant="destructive">High Priority</Badge>;
    if (daysSinceCreated > 3) return <Badge className="bg-orange-100 text-orange-800">Medium Priority</Badge>;
    return <Badge className="bg-blue-100 text-blue-800">Normal</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Property Verification Queue</h2>
          <p className="text-gray-600">Review and verify property listings and documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Documents ({documents.length})
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">
                  {properties.filter(p => 
                    Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)) > 7
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Documents</p>
                <p className="text-2xl font-bold">
                  {properties.filter(p => p.documents && p.documents.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Review Time</p>
                <p className="text-2xl font-bold">2.3 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Properties ({properties.length})</CardTitle>
          <CardDescription>Properties awaiting verification review</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading properties...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{property.title || 'Untitled Property'}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.location?.city || 'Location not specified'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {property.users?.first_name} {property.users?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{property.users?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{property.type}</Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(property.created_at)}</TableCell>
                    <TableCell>{new Date(property.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Dialog 
                        open={isReviewDialogOpen && selectedProperty?.id === property.id} 
                        onOpenChange={(open) => {
                          setIsReviewDialogOpen(open);
                          if (open) {
                            setSelectedProperty(property);
                            fetchPropertyDocuments(property.id);
                          } else {
                            setSelectedProperty(null);
                            setVerificationNotes('');
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Property Verification Review</DialogTitle>
                            <DialogDescription>
                              Review property details and documents before approval
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedProperty && (
                            <div className="space-y-6">
                              {/* Property Details */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-base font-medium">Property Information</Label>
                                  <div className="mt-2 space-y-2">
                                    <div>
                                      <span className="text-sm text-gray-500">Title:</span>
                                      <p className="font-medium">{selectedProperty.title || 'Untitled'}</p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-500">Type:</span>
                                      <p className="font-medium">{selectedProperty.type}</p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-500">Category:</span>
                                      <p className="font-medium">{selectedProperty.category}</p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-500">Price:</span>
                                      <p className="font-medium">
                                        {selectedProperty.price?.currency} {selectedProperty.price?.amount?.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-base font-medium">Location</Label>
                                  <div className="mt-2 space-y-2">
                                    <div>
                                      <span className="text-sm text-gray-500">Address:</span>
                                      <p className="font-medium">{selectedProperty.location?.address || 'Not specified'}</p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-500">City:</span>
                                      <p className="font-medium">{selectedProperty.location?.city || 'Not specified'}</p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-500">State:</span>
                                      <p className="font-medium">{selectedProperty.location?.state || 'Not specified'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Documents */}
                              <div>
                                <Label className="text-base font-medium">Documents ({documents.length})</Label>
                                {documents.length > 0 ? (
                                  <div className="mt-2 space-y-2">
                                    {documents.map((doc) => (
                                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                          <p className="font-medium">{doc.document_name}</p>
                                          <p className="text-sm text-gray-500">{doc.document_type}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {getStatusBadge(doc.status)}
                                          <Button variant="outline" size="sm">
                                            View
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-500 mt-2">No documents uploaded</p>
                                )}
                              </div>

                              {/* Verification Notes */}
                              <div>
                                <Label htmlFor="notes">Verification Notes</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add any notes about this verification..."
                                  value={verificationNotes}
                                  onChange={(e) => setVerificationNotes(e.target.value)}
                                  className="mt-2"
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                  variant="destructive"
                                  onClick={() => verifyProperty(selectedProperty.id, false)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  onClick={() => verifyProperty(selectedProperty.id, true)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
