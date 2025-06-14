
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye,
  Trash2,
  Calendar,
  MapPin,
  Building,
  AlertCircle,
  Users,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const {
    pendingOpportunities,
    allOpportunities,
    loading,
    isAdmin,
    approveOpportunity,
    rejectOpportunity,
    deleteOpportunity
  } = useAdmin();

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statuses = ["All", "pending", "approved", "rejected"];

  const getOpportunities = () => {
    let opportunities = selectedStatus === "pending" ? pendingOpportunities : allOpportunities;
    
    if (selectedStatus === "approved") {
      opportunities = allOpportunities.filter(opp => opp.is_approved === true);
    } else if (selectedStatus === "rejected") {
      opportunities = allOpportunities.filter(opp => opp.is_approved === false && opp.rejection_reason);
    }

    return opportunities.filter(opportunity => {
      const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (opportunity.company?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  const filteredOpportunities = getOpportunities();

  const getStatusColor = (opportunity: any) => {
    if (opportunity.is_approved === true) return "bg-green-100 text-green-800 border-green-200";
    if (opportunity.rejection_reason) return "bg-red-100 text-red-800 border-red-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getStatusText = (opportunity: any) => {
    if (opportunity.is_approved === true) return "approved";
    if (opportunity.rejection_reason) return "rejected";
    return "pending";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Internship": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Contest": return "bg-green-100 text-green-800 border-green-200";
      case "Event": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Scholarship": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleReject = async () => {
    if (selectedOpportunityId && rejectionReason.trim()) {
      await rejectOpportunity(selectedOpportunityId, rejectionReason);
      setRejectionReason("");
      setSelectedOpportunityId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-2">Manage submitted opportunities</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Pending: {pendingOpportunities.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Total: {allOpportunities.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <div className="space-y-2">
                    {statuses.map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status.toLowerCase())}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-colors capitalize",
                          selectedStatus === status.toLowerCase()
                            ? "bg-blue-100 text-blue-800 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions List */}
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredOpportunities.length} submissions
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading opportunities...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOpportunities.map(opportunity => (
                  <Card key={opportunity.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getStatusColor(opportunity)}>
                              {getStatusText(opportunity)}
                            </Badge>
                            <Badge className={getTypeColor(opportunity.type)}>
                              {opportunity.type}
                            </Badge>
                            <Badge variant="outline">{opportunity.domain}</Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">
                            {opportunity.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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
                              Deadline: {format(new Date(opportunity.deadline), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Submitted: {format(new Date(opportunity.created_at), 'MMM dd, yyyy')}
                          </p>
                          {opportunity.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                              <p className="text-red-800 text-sm font-medium">Rejection Reason:</p>
                              <p className="text-red-700 text-sm">{opportunity.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        {opportunity.description}
                      </p>
                      {opportunity.tags && opportunity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {opportunity.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3">
                        {!opportunity.is_approved && !opportunity.rejection_reason && (
                          <>
                            <Button
                              onClick={() => approveOpportunity(opportunity.id)}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                              disabled={loading}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setSelectedOpportunityId(opportunity.id)}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Opportunity</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Rejection Reason</label>
                                    <Textarea
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Please provide a reason for rejection..."
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setRejectionReason("");
                                        setSelectedOpportunityId(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={handleReject}
                                      disabled={!rejectionReason.trim() || loading}
                                    >
                                      Reject Opportunity
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <a href={opportunity.source_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Source
                          </a>
                        </Button>
                        <Button
                          onClick={() => deleteOpportunity(opportunity.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={loading}
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

            {filteredOpportunities.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters to find more submissions.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("pending");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
