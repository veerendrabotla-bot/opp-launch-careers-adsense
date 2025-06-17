
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, HelpCircle, Book, MessageCircle, Video, FileText } from 'lucide-react';

const HelpCenter = () => {
  const helpCategories = [
    {
      title: "Getting Started",
      icon: Book,
      articles: [
        "How to create an account",
        "Setting up your profile",
        "Finding opportunities",
        "Understanding opportunity types"
      ]
    },
    {
      title: "Managing Opportunities",
      icon: FileText,
      articles: [
        "How to bookmark opportunities",
        "Submitting new opportunities",
        "Understanding approval process",
        "Managing deadlines"
      ]
    },
    {
      title: "AI Resume Tailor",
      icon: Video,
      articles: [
        "How to use AI Resume Tailor",
        "Best practices for resume customization",
        "Understanding AI suggestions",
        "Exporting your tailored resume"
      ]
    },
    {
      title: "Account & Settings",
      icon: MessageCircle,
      articles: [
        "Updating your profile",
        "Notification preferences",
        "Privacy settings",
        "Account security"
      ]
    }
  ];

  const faqs = [
    {
      question: "How do I find opportunities that match my interests?",
      answer: "Use our advanced filtering system on the Opportunities page to filter by type, domain, and search for specific keywords."
    },
    {
      question: "Can I submit opportunities from my organization?",
      answer: "Yes! Any registered user can submit opportunities. They go through a moderation process before being published."
    },
    {
      question: "Is the AI Resume Tailor free to use?",
      answer: "Yes, the AI Resume Tailor is completely free for all registered users."
    },
    {
      question: "How often are new opportunities added?",
      answer: "New opportunities are added daily. We recommend checking back regularly or enabling notifications."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
          <p className="text-xl text-gray-600 mb-8">Find answers to common questions and get support</p>
          
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for help articles..."
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {helpCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <category.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.articles.map((article, idx) => (
                    <li key={idx} className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                      {article}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">Can't find what you're looking for? Contact our support team.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Card className="p-6">
              <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-4">Get instant help from our support team</p>
              <Badge variant="secondary">Available 24/7</Badge>
            </Card>
            <Card className="p-6">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Submit a Ticket</h3>
              <p className="text-sm text-gray-600 mb-4">Send us a detailed message about your issue</p>
              <Badge variant="secondary">Response in 24h</Badge>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
