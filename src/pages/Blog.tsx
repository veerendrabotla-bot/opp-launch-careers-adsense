
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, User, ArrowRight, TrendingUp, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import SEO from '@/components/SEO';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const featuredPost = {
    title: "The Future of Remote Internships: Trends and Opportunities in 2025",
    excerpt: "Explore how remote work is reshaping internship programs and creating new opportunities for students worldwide. Learn about the latest trends, tools, and strategies for success.",
    author: "Sarah Johnson",
    date: "January 2, 2025",
    category: "Career Insights",
    readTime: "8 min read",
    image: "/placeholder.svg",
    slug: "future-remote-internships-2025"
  };

  const blogPosts = [
    {
      title: "How to Write a Winning Scholarship Essay: Complete Guide 2025",
      excerpt: "Master the art of scholarship essay writing with our comprehensive guide. Learn proven strategies, common mistakes to avoid, and examples from successful applicants.",
      author: "Michael Chen",
      date: "December 28, 2024",
      category: "Education",
      readTime: "10 min read",
      slug: "winning-scholarship-essay-guide-2025"
    },
    {
      title: "Top 15 Programming Contests for Students in 2025",
      excerpt: "Discover the most prestigious programming competitions that can boost your career and skills. From local hackathons to international championships.",
      author: "Emily Rodriguez",
      date: "December 25, 2024",
      category: "Technology",
      readTime: "6 min read",
      slug: "top-programming-contests-2025"
    },
    {
      title: "Networking at Virtual Events: Complete Success Guide",
      excerpt: "Master the art of virtual networking and build meaningful professional connections online. Learn proven techniques for making lasting impressions.",
      author: "David Kim",
      date: "December 22, 2024",
      category: "Professional Development",
      readTime: "7 min read",
      slug: "virtual-networking-success-guide"
    },
    {
      title: "AI Resume Builder: Maximizing Your Job Application Success",
      excerpt: "Learn how to leverage AI tools to create targeted resumes that get noticed by employers. Step-by-step guide with examples and templates.",
      author: "Sarah Johnson",
      date: "December 20, 2024",
      category: "Career Tips",
      readTime: "9 min read",
      slug: "ai-resume-builder-guide-2025"
    },
    {
      title: "International Study Opportunities: Complete Guide 2025",
      excerpt: "A comprehensive guide to finding and applying for international study opportunities, scholarships, and exchange programs worldwide.",
      author: "Michael Chen",
      date: "December 18, 2024",
      category: "Global Opportunities",
      readTime: "12 min read",
      slug: "international-study-opportunities-2025"
    },
    {
      title: "Building a Portfolio That Impresses Tech Employers",
      excerpt: "Discover what types of projects and experiences make the biggest impact on potential tech employers. Real examples from successful hires.",
      author: "Emily Rodriguez",
      date: "December 15, 2024",
      category: "Career Development",
      readTime: "8 min read",
      slug: "tech-portfolio-guide-2025"
    }
  ];

  const categories = [
    "All",
    "Career Tips",
    "Technology", 
    "Education",
    "Professional Development",
    "Global Opportunities",
    "Career Development",
    "Career Insights"
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEO 
        title="Career Guidance Blog - OpportunityHub"
        description="Expert career advice, internship tips, scholarship guides, and professional development resources for students and job seekers."
        keywords="career blog, internship tips, scholarship advice, job search, career development, professional growth"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-6">
              <BackButton to="/" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Career Guidance Blog</h1>
                <p className="text-xl text-gray-600 mt-2">
                  Expert insights, tips, and strategies to accelerate your career journey
                </p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white min-w-[200px]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Featured Post */}
          <Card className="mb-12 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="h-64 md:h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="h-24 w-24 text-white opacity-50" />
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <Badge className="mb-4 bg-blue-100 text-blue-800">{featuredPost.category}</Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {featuredPost.date}
                  </div>
                  <span>{featuredPost.readTime}</span>
                </div>
                <Link to={`/blog/${featuredPost.slug}`}>
                  <Button className="group">
                    Read Full Article
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </div>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="outline" className="w-full group">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or selecting a different category.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Newsletter Signup */}
          <Card className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Updated with Career Insights</h2>
              <p className="text-xl mb-6 opacity-90">
                Get the latest career tips, opportunity alerts, and success stories delivered to your inbox.
              </p>
              <div className="max-w-md mx-auto flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-2 rounded-lg text-gray-900"
                />
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Subscribe Now
                </Button>
              </div>
              <p className="text-sm mt-4 opacity-75">
                Join 10,000+ professionals who read our weekly newsletter
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Blog;
