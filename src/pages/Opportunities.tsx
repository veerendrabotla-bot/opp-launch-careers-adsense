
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdvancedFilters from '@/components/AdvancedFilters';
import { 
  Calendar, 
  MapPin, 
  Building, 
  Search,
  Bookmark,
  BookmarkCheck,
  Eye,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';

const Opportunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    search: '',
    type: 'All',
    domain: 'All',
    location: 'All',
    remoteOnly: false,
    experienceLevel: 'All',
    employmentType: 'All',
    featured: false
  });
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null);

  const { opportunities, loading, error } = useOpportunities(filters);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('opportunity_id')
        .eq('user_id', user.id);

      if (data) {
        setBookmarkedIds(new Set(data.map(b => b.opportunity_id)));
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (opportunityId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark opportunities",
        variant: "destructive"
      });
      return;
    }

    try {
      setBookmarkLoading(opportunityId);
      const isBookmarked = bookmarkedIds.has(opportunityId);

      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunityId);
        
        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(opportunityId);
          return newSet;
        });
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            opportunity_id: opportunityId
          });
        
        setBookmarkedIds(prev => new Set([...prev, opportunityId]));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setBookmarkLoading(null);
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

  const isExpired = (deadline: string) => new Date(deadline) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
              <p className="text-gray-600 mt-2">
                Discover internships, contests, events, and scholarships
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{opportunities.length} opportunities found</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search opportunities, companies, locations..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="All">All Types</option>
              <option value="Internship">Internships</option>
              <option value="Contest">Contests</option>
              <option value="Event">Events</option>
              <option value="Scholarship">Scholarships</option>
            </select>

            <AdvancedFilters 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading opportunities: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && opportunities.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Button onClick={() => setFilters({
              search: '',
              type: 'All',
              domain: 'All',
              location: 'All',
              remoteOnly: false,
              experienceLevel: 'All',
              employmentType: 'All',
              featured: false
            })}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && opportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map(opportunity => (
              <Link key={opportunity.id} to={`/opportunity/${opportunity.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full relative group">
                  {/* Bookmark Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => toggleBookmark(opportunity.id, e)}
                    disabled={bookmarkLoading === opportunity.id}
                  >
                    {bookmarkedIds.has(opportunity.id) ? (
                      <BookmarkCheck className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getTypeColor(opportunity.type)}>
                          {opportunity.type}
                        </Badge>
                        <Badge variant="outline">{opportunity.domain}</Badge>
                        {opportunity.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {isExpired(opportunity.deadline) && (
                          <Badge variant="destructive">
                            <Clock className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg leading-tight mb-2">
                      {opportunity.title}
                    </CardTitle>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {opportunity.company && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span className="truncate">{opportunity.company}</span>
                        </div>
                      )}
                      {opportunity.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{opportunity.location}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="line-clamp-3 mb-4">
                      {opportunity.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className={isExpired(opportunity.deadline) ? 'text-red-600' : ''}>
                          {new Date(opportunity.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {opportunity.remote_work_allowed && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-xs">Remote</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{opportunity.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
