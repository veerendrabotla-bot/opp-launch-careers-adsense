
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Bookmark, 
  Calendar, 
  ExternalLink, 
  MapPin, 
  Building, 
  Share2,
  Clock,
  User,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Opportunity = Database['public']['Tables']['opportunities']['Row'];

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const { toast } = useToast();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedOpportunities, setRelatedOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Fetch main opportunity
        const { data: opportunityData, error: opportunityError } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', id)
          .single();

        if (opportunityError) throw opportunityError;
        
        setOpportunity(opportunityData);

        // Increment view count
        await supabase
          .from('opportunities')
          .update({ views: (opportunityData.views || 0) + 1 })
          .eq('id', id);

        // Fetch related opportunities
        const { data: relatedData } = await supabase
          .from('opportunities')
          .select('*')
          .eq('domain', opportunityData.domain)
          .neq('id', id)
          .eq('is_approved', true)
          .limit(3);

        setRelatedOpportunities(relatedData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  const handleApply = () =>  {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for opportunities.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (opportunity?.source_url) {
      window.open(opportunity.source_url, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share && opportunity) {
      try {
        await navigator.share({
          title: opportunity.title,
          text: opportunity.description.substring(0, 100) + "...",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The opportunity link has been copied to your clipboard.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days left`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Opportunity not found</h3>
          <p className="text-gray-600 mb-4">{error || "The opportunity you're looking for doesn't exist."}</p>
          <Link to="/opportunities">
            <Button>Back to Opportunities</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(opportunity.id);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/opportunities">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Opportunities
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={getTypeColor(opportunity.type)}>
                  {opportunity.type}
                </Badge>
                <Badge variant="outline">{opportunity.domain}</Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {opportunity.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                {opportunity.company && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{opportunity.company}</span>
                  </div>
                )}
                {opportunity.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{opportunity.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Deadline: {formatDate(opportunity.deadline)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium text-orange-600">
                    {getTimeLeft(opportunity.deadline)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span>{opportunity.views || 0} views</span>
                <span>{opportunity.applications || 0} applications</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => toggleBookmark(opportunity.id)}
                className={cn(
                  "flex items-center gap-2",
                  isBookmarked && "text-blue-600 border-blue-600"
                )}
              >
                <Bookmark className={cn(
                  "h-4 w-4",
                  isBookmarked && "fill-current"
                )} />
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              <Button 
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tags */}
            {opportunity.tags && opportunity.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About this Opportunity</h3>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="prose prose-gray max-w-none">
                  {opportunity.description.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-gray-900">
                          {paragraph.substring(3)}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      return (
                        <li key={index} className="ml-4 mb-1 text-gray-700">
                          {paragraph.substring(2)}
                        </li>
                      );
                    }
                    return paragraph.trim() && (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleApply}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply on Original Site
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => toggleBookmark(opportunity.id)}
                  className="w-full"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save for Later
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share with Friends
                </Button>
              </CardContent>
            </Card>

            {/* Related Opportunities */}
            {relatedOpportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedOpportunities.map((opp) => (
                    <Link 
                      key={opp.id}
                      to={`/opportunities/${opp.id}`}
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">{opp.title}</h4>
                      {opp.company && <p className="text-sm text-gray-600 mb-2">{opp.company}</p>}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {opp.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(opp.deadline)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">💡 Application Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Tailor your resume to match the job requirements</li>
                  <li>• Research the company and mention specific details</li>
                  <li>• Highlight relevant projects and experience</li>
                  <li>• Apply early to increase your chances</li>
                </ul>
                <Link to="/tailor" className="inline-block mt-3">
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                    Use AI Resume Tailor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;
