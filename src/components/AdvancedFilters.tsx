
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';

interface AdvancedFiltersProps {
  filters: {
    type?: string;
    domain?: string;
    search?: string;
    location?: string;
    remoteOnly?: boolean;
    experienceLevel?: string;
    employmentType?: string;
    featured?: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ filters, onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      type: 'All',
      domain: 'All',
      location: 'All',
      remoteOnly: false,
      experienceLevel: 'All',
      employmentType: 'All',
      featured: false
    });
  };

  const hasActiveFilters = filters.type !== 'All' || 
                          filters.domain !== 'All' || 
                          filters.location !== 'All' ||
                          filters.remoteOnly ||
                          filters.experienceLevel !== 'All' ||
                          filters.employmentType !== 'All' ||
                          filters.featured;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full"></span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your search to find the perfect opportunities
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Opportunity Type */}
          <div className="space-y-2">
            <Label>Opportunity Type</Label>
            <Select
              value={filters.type || 'All'}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Internship">Internships</SelectItem>
                <SelectItem value="Contest">Contests</SelectItem>
                <SelectItem value="Event">Events</SelectItem>
                <SelectItem value="Scholarship">Scholarships</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <Label>Domain</Label>
            <Select
              value={filters.domain || 'All'}
              onValueChange={(value) => handleFilterChange('domain', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Domains</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="Enter city, state, or country"
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select
              value={filters.experienceLevel || 'All'}
              onValueChange={(value) => handleFilterChange('experienceLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Select
              value={filters.employmentType || 'All'}
              onValueChange={(value) => handleFilterChange('employmentType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={filters.remoteOnly || false}
                onCheckedChange={(checked) => handleFilterChange('remoteOnly', checked)}
              />
              <Label htmlFor="remote">Remote work allowed</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={filters.featured || false}
                onCheckedChange={(checked) => handleFilterChange('featured', checked)}
              />
              <Label htmlFor="featured">Featured opportunities only</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;
