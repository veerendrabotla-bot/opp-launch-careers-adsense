
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  Building, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck,
  Clock,
  DollarSign,
  Users,
  Mail,
  Phone,
  CheckCircle,
  ArrowLeft,
  Share2,
  Eye
} from 'lucide-react';

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOpportunity();
      if (user) {
        checkBookmarkStatus();
        trackView();
      }
    }
  }, [id, user]);

  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .eq('is_approved', true)
        .single();

      if (error) throw error;
      setOpportunity(data);

      // Increment view count
      await supabase
        .from('opportunities')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', id);

    } catch (error: any) {
      console.error('Error fetching opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to load opportunity details",
        variant: "destructive"
      });
      navigate('/opportunities');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', id)
        .single();

      setIsBookmarked(!!data);
    } catch (error) {
      // Not bookmarked
    }
  };

  const trackView = async () => {
    if (!user || !id) return;

    try {
      await supabase
        .from('recently_viewed')
        .upsert({
          user_id: user.id,
          opportunity_id: id,
          viewed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,opportunity_id'
        });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark opportunities",
        variant: "destructive"
      });
      return;
    }

    try {
      setBookmarkLoading(true);

      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', id);
        
        setIsBookmarked(false);
        toast({
          title: "Removed from bookmarks",
          description: "Opportunity removed from your bookmarks"
        });
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            opportunity_id: id
          });
        
        setIsBookmarked(true);
        toast({
          title: "Added to bookmarks",
          description: "Opportunity saved to your bookmarks"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setBookmarkLoading(false);
    }
  };

  const shareOpportunity = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: opportunity?.title,
          text: opportunity?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Opportunity link copied to clipboard"
      });
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

  const isExpired = opportunity && new Date(opportunity.deadline) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity not found</h2>
          <p className="text-gray-600 mb-4">The opportunity you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/opportunities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/opportunities')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={shareOpportunity}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 mr-2" />
              ) : (
                <Bookmark className="h-4 w-4 mr-2" />
              )}
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getTypeColor(opportunity.type)}>
                        {opportunity.type}
                      </Badge>
                      <Badge variant="outline">{opportunity.domain}</Badge>
                      {opportunity.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </Badge>
                      )}
                      {isExpired && (
                        <Badge variant="destructive">
                          <Clock className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      )}
                    </div>
                    
                    <CardTitle className="text-2xl mb-3">{opportunity.title}</CardTitle>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                      {opportunity.employment_type && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {opportunity.employment_type}
                        </div>
                      )}
                      {opportunity.remote_work_allowed && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Remote OK
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{opportunity.description}</p>
                </div>

                {/* Requirements */}
                {opportunity.requirements && opportunity.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {opportunity.requirements.map((req: string, index: number) => (
                        <li key={index} className="text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {opportunity.benefits && opportunity.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {opportunity.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="text-gray-700">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Application Instructions */}
                {opportunity.application_instructions && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">How to Apply</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{opportunity.application_instructions}</p>
                  </div>
                )}

                {/* Tags */}
                {opportunity.tags && opportunity.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Deadline</p>
                    <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                      {new Date(opportunity.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {opportunity.application_deadline && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Application Deadline</p>
                      <p className="text-sm text-gray-600">
                        {new Date(opportunity.application_deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.salary_range && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Salary Range</p>
                      <p className="text-sm text-gray-600">{opportunity.salary_range}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Views</p>
                    <p className="text-sm text-gray-600">{opportunity.views || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(opportunity.contact_email || opportunity.contact_phone) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {opportunity.contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a 
                        href={`mailto:${opportunity.contact_email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {opportunity.contact_email}
                      </a>
                    </div>
                  )}
                  {opportunity.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a 
                        href={`tel:${opportunity.contact_phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {opportunity.contact_phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => window.open(opportunity.source_url, '_blank')}
                  disabled={isExpired}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {isExpired ? 'Opportunity Expired' : 'Apply Now'}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  You'll be redirected to the original posting
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;
