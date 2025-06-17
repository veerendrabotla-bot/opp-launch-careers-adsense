
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Archive, Trash2, RefreshCw, Loader2, Calendar, Building, MapPin } from 'lucide-react';

const AdminExpired = () => {
  const [expiredOpportunities, setExpiredOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExpiredOpportunities();
  }, []);

  const fetchExpiredOpportunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .lt('deadline', new Date().toISOString().split('T')[0])
        .eq('is_approved', true)
        .order('deadline', { ascending: false });

      if (error) throw error;
      setExpiredOpportunities(data || []);
    } catch (error: any) {
      console.error('Error fetching expired opportunities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch expired opportunities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const extendDeadline = async (opportunityId: string) => {
    try {
      setActionLoading(opportunityId);
      
      // Extend deadline by 30 days
      const newDeadline = new Date();
      newDeadline.setDate(newDeadline.getDate() + 30);
      
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          deadline: newDeadline.toISOString().split('T')[0],
          is_expired: false
        })
        .eq('id', opportunityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deadline extended by 30 days"
      });

      fetchExpiredOpportunities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const archiveOpportunity = async (opportunityId: string) => {
    try {
      setActionLoading(opportunityId);
      
      const { error } = await supabase
        .from('opportunities')
        .update({ is_expired: true })
        .eq('id', opportunityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Opportunity archived"
      });

      fetchExpiredOpportunities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteOpportunity = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to permanently delete this opportunity?')) return;

    try {
      setActionLoading(opportunityId);
      
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Opportunity deleted permanently"
      });

      fetchExpiredOpportunities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Internship": return "bg-blue-100 text-blue-800";
      case "Contest": return "bg-green-100 text-green-800";
      case "Event": return "bg-purple-100 text-purple-800";
      case "Scholarship": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const daysSinceExpired = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = today.getTime() - deadlineDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading expired opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expired Opportunities</h1>
              <p className="text-gray-600 mt-2">Manage opportunities past their deadline</p>
            </div>
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">{expiredOpportunities.length} expired</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {expiredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Archive className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No expired opportunities</h2>
              <p className="text-gray-600">All opportunities are within their deadline.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {expiredOpportunities.map(opportunity => (
              <Card key={opportunity.id} className="border-red-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getTypeColor(opportunity.type)}>
                          {opportunity.type}
                        </Badge>
                        <Badge variant="outline">{opportunity.domain}</Badge>
                        <Badge variant="destructive">
                          Expired {daysSinceExpired(opportunity.deadline)} days ago
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{opportunity.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {opportunity.company && (
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {opportunity.company}
                          </div>
                        )}
                        {opportunity.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {opportunity.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Expired: {new Date(opportunity.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{opportunity.description}</p>
                  
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      onClick={() => extendDeadline(opportunity.id)}
                      disabled={actionLoading === opportunity.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === opportunity.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Extend Deadline
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => archiveOpportunity(opportunity.id)}
                      disabled={actionLoading === opportunity.id}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => deleteOpportunity(opportunity.id)}
                      disabled={actionLoading === opportunity.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExpired;
