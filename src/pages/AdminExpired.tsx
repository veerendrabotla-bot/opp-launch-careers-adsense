
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { format, addDays } from 'date-fns';
import { 
  Calendar, 
  AlertTriangle, 
  Trash2, 
  RefreshCw,
  Clock,
  Archive
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminExpired = () => {
  const { allOpportunities, isAdmin, deleteOpportunity, markExpiredOpportunities } = useAdmin();
  const [filter, setFilter] = useState<'expired' | 'expiring-soon' | 'all'>('expired');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date();
  const threeDaysFromNow = addDays(today, 3);

  const getFilteredOpportunities = () => {
    switch (filter) {
      case 'expired':
        return allOpportunities.filter(opp => new Date(opp.deadline) < today);
      case 'expiring-soon':
        return allOpportunities.filter(opp => {
          const deadline = new Date(opp.deadline);
          return deadline >= today && deadline <= threeDaysFromNow;
        });
      default:
        return allOpportunities.filter(opp => {
          const deadline = new Date(opp.deadline);
          return deadline <= threeDaysFromNow;
        });
    }
  };

  const filteredOpportunities = getFilteredOpportunities();
  const expiredCount = allOpportunities.filter(opp => new Date(opp.deadline) < today).length;
  const expiringSoonCount = allOpportunities.filter(opp => {
    const deadline = new Date(opp.deadline);
    return deadline >= today && deadline <= threeDaysFromNow;
  }).length;

  const handleBulkDelete = async () => {
    const expiredOps = allOpportunities.filter(opp => new Date(opp.deadline) < today);
    for (const opp of expiredOps) {
      await deleteOpportunity(opp.id);
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: `Expired ${Math.abs(diffDays)} days ago`, variant: 'destructive' as const };
    } else if (diffDays <= 3) {
      return { label: `Expires in ${diffDays} days`, variant: 'secondary' as const };
    } else {
      return { label: `${diffDays} days left`, variant: 'outline' as const };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-gray-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Expired Content Manager</h1>
                <p className="text-gray-600 mt-2">Manage expired and expiring opportunities</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={markExpiredOpportunities} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Expired ({expiredCount})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Expired Opportunities</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {expiredCount} expired opportunities. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>Delete All</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer" onClick={() => setFilter('expired')}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer" onClick={() => setFilter('expiring-soon')}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-gray-900">{expiringSoonCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer" onClick={() => setFilter('all')}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Archive className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">All Tracked</p>
                  <p className="text-2xl font-bold text-gray-900">{expiredCount + expiringSoonCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={filter === 'expired' ? 'default' : 'outline'}
            onClick={() => setFilter('expired')}
          >
            Expired ({expiredCount})
          </Button>
          <Button 
            variant={filter === 'expiring-soon' ? 'default' : 'outline'}
            onClick={() => setFilter('expiring-soon')}
          >
            Expiring Soon ({expiringSoonCount})
          </Button>
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {filteredOpportunities.map(opportunity => {
            const deadlineStatus = getDeadlineStatus(opportunity.deadline);
            return (
              <Card key={opportunity.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                        <Badge variant={deadlineStatus.variant}>
                          {deadlineStatus.label}
                        </Badge>
                        <Badge variant="outline">{opportunity.type}</Badge>
                        <Badge variant="outline">{opportunity.domain}</Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{opportunity.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Deadline: {format(new Date(opportunity.deadline), 'MMM dd, yyyy')}</span>
                        <span>Created: {format(new Date(opportunity.created_at), 'MMM dd, yyyy')}</span>
                        {opportunity.company && <span>Company: {opportunity.company}</span>}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{opportunity.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteOpportunity(opportunity.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600">
              {filter === 'expired' && 'No expired opportunities to manage.'}
              {filter === 'expiring-soon' && 'No opportunities expiring in the next 3 days.'}
              {filter === 'all' && 'No opportunities require attention.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExpired;
