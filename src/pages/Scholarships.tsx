
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useBookmarks } from '@/hooks/useBookmarks';
import BackButton from '@/components/BackButton';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  Calendar,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Eye
} from 'lucide-react';

const Scholarships = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  
  const { opportunities, loading } = useOpportunities({
    type: 'Scholarship',
    search: searchTerm,
    location: locationFilter !== 'All' ? locationFilter : undefined
  });

  const { bookmarks, toggleBookmark } = useBookmarks();
  const filteredScholarships = opportunities.filter(opp => opp.type === 'Scholarship');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading scholarships...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-amber-600" />
                Scholarships
              </h1>
              <p className="text-gray-600 mt-2">Find scholarship opportunities to fund your education</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
        {filteredScholarships.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <GraduationCap className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No scholarships found</h2>
              <p className="text-gray-600">
                {searchTerm || locationFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'New scholarships will appear here soon!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredScholarships.map(scholarship => (
              <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-amber-100 text-amber-800">
                          Scholarship
                        </Badge>
                        {scholarship.featured && (
                          <Badge className="bg-purple-100 text-purple-800">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        <Link 
                          to={`/opportunities/${scholarship.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {scholarship.title}
                        </Link>
                      </CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleBookmark(scholarship.id)}
                    >
                      {bookmarks.includes(scholarship.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {scholarship.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    {scholarship.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {scholarship.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  {scholarship.tags && scholarship.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {scholarship.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {scholarship.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{scholarship.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      {scholarship.domain}
                    </span>
                    <div className="flex gap-2">
                      <Link to={`/opportunities/${scholarship.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </Link>
                      <a 
                        href={scholarship.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button size="sm">
                          Apply
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </a>
                    </div>
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

export default Scholarships;
