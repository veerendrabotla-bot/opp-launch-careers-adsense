
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const featuredPost = {
    title: "The Future of Remote Internships: Trends and Opportunities",
    excerpt: "Explore how remote work is reshaping internship programs and creating new opportunities for students worldwide.",
    author: "Sarah Johnson",
    date: "December 15, 2024",
    category: "Career Insights",
    readTime: "5 min read",
    image: "/placeholder.svg"
  };

  const blogPosts = [
    {
      title: "How to Write a Winning Scholarship Essay",
      excerpt: "Essential tips and strategies to make your scholarship application stand out from the competition.",
      author: "Michael Chen",
      date: "December 10, 2024",
      category: "Education",
      readTime: "7 min read"
    },
    {
      title: "Top 10 Programming Contests for Students in 2024",
      excerpt: "Discover the most prestigious programming competitions that can boost your career and skills.",
      author: "Emily Rodriguez",
      date: "December 8, 2024",
      category: "Technology",
      readTime: "6 min read"
    },
    {
      title: "Networking at Virtual Events: A Complete Guide",
      excerpt: "Master the art of virtual networking and build meaningful professional connections online.",
      author: "David Kim",
      date: "December 5, 2024",
      category: "Professional Development",
      readTime: "8 min read"
    },
    {
      title: "AI Resume Tailor: Maximizing Your Job Application Success",
      excerpt: "Learn how to leverage AI tools to create targeted resumes that get noticed by employers.",
      author: "Sarah Johnson",
      date: "December 3, 2024",
      category: "Career Tips",
      readTime: "5 min read"
    },
    {
      title: "International Opportunities: Studying and Working Abroad",
      excerpt: "A comprehensive guide to finding and applying for international opportunities.",
      author: "Michael Chen",
      date: "November 28, 2024",
      category: "Global Opportunities",
      readTime: "9 min read"
    },
    {
      title: "Building Your Portfolio: Projects That Impress Employers",
      excerpt: "Discover what types of projects and experiences make the biggest impact on potential employers.",
      author: "Emily Rodriguez",
      date: "November 25, 2024",
      category: "Career Development",
      readTime: "6 min read"
    }
  ];

  const categories = [
    "All Posts",
    "Career Tips",
    "Technology",
    "Education",
    "Professional Development",
    "Global Opportunities"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OpportunityHub Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, tips, and stories to help you discover and seize the best opportunities for your career and education.
          </p>
        </div>

        {/* Featured Post */}
        <Card className="mb-12 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="h-64 md:h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="h-24 w-24 text-white opacity-50" />
              </div>
            </div>
            <div className="md:w-1/2 p-8">
              <Badge className="mb-4">{featuredPost.category}</Badge>
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
              <Button className="group">
                Read More
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category, index) => (
            <Badge
              key={index}
              variant={index === 0 ? "default" : "secondary"}
              className="cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>
                <CardTitle className="group-hover:text-blue-600 transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <Card className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-6 opacity-90">
              Subscribe to our newsletter for the latest career insights and opportunity alerts.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Blog;
