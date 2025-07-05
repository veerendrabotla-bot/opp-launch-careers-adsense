
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOpportunities } from '@/hooks/useOpportunities';
import BackButton from '@/components/BackButton';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar,
  MapPin,
  Building,
  ExternalLink,
  Bookmark,
  Filter,
  Loader2
} from 'lucide-react';

const Opportunities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  
  const { opportunities, loading } = useOpportunities({
    type: typeFilter !== 'All' ? typeFilter : undefined,
    search: searchTerm,
    location: locationFilter !== 'All' ? locationFilter : undefined
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Internship": return "bg-blue-100 text-blue-800";
      case "Contest": return "bg-green-100 text-green-800";
      case "Event": return "bg-purple-100 text-purple-800";
      case "Scholarship": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <BackButton to="/" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Opportunities</h1>
              <p className="text-gray-600 mt-2">Discover internships, contests, events, and scholarships</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="All">All Types</option>
              <option value="Internship">Internships</option>
              <option value="Contest">Contests</option>
              <option value="Event">Events</option>
              <option value="Scholarship">Scholarships</option>
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="All">All Locations</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No opportunities found</h2>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== 'All' || locationFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'New opportunities will appear here soon!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map(opportunity => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(opportunity.type)}>
                          {opportunity.type}
                        </Badge>
                        {opportunity.featured && (
                          <Badge className="bg-purple-100 text-purple-800">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        <Link 
                          to={`/opportunities/${opportunity.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {opportunity.title}
                        </Link>
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {opportunity.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    {opportunity.company && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        {opportunity.company}
                      </div>
                    )}
                    {opportunity.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {opportunity.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  {opportunity.tags && opportunity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {opportunity.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {opportunity.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{opportunity.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      {opportunity.domain}
                    </span>
                    <a 
                      href={opportunity.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button size="sm">
                        Apply Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
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

export default Opportunities;
