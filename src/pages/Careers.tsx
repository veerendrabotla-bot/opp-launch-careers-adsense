
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Users, Heart, Zap, Target, Globe } from 'lucide-react';

const Careers = () => {
  const openPositions = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote / San Francisco",
      type: "Full-time",
      salary: "$120k - $160k",
      description: "Join our frontend team to build beautiful and performant user interfaces using React and TypeScript.",
      requirements: ["5+ years React experience", "TypeScript proficiency", "UI/UX sensibility"]
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Remote / New York",
      type: "Full-time",
      salary: "$130k - $170k",
      description: "Lead product strategy and development for our core platform features and user experience.",
      requirements: ["3+ years product management", "Data-driven mindset", "SaaS experience"]
    },
    {
      title: "Content Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      salary: "$80k - $110k",
      description: "Create compelling content strategy to engage our community and drive platform growth.",
      requirements: ["Content marketing experience", "SEO knowledge", "Writing skills"]
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote / Austin",
      type: "Full-time",
      salary: "$110k - $150k",
      description: "Build and maintain our cloud infrastructure, CI/CD pipelines, and monitoring systems.",
      requirements: ["AWS/GCP experience", "Docker/Kubernetes", "Infrastructure as Code"]
    },
    {
      title: "UX Designer",
      department: "Design",
      location: "Remote / Los Angeles",
      type: "Full-time",
      salary: "$90k - $130k",
      description: "Design intuitive user experiences that help users discover and apply to opportunities.",
      requirements: ["5+ years UX design", "Figma proficiency", "User research experience"]
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      salary: "$70k - $95k",
      description: "Help our users succeed on the platform and drive engagement and retention.",
      requirements: ["Customer success experience", "Strong communication", "Problem-solving skills"]
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance plus wellness stipend"
    },
    {
      icon: Zap,
      title: "Professional Growth",
      description: "Learning budget, conference attendance, and career development programs"
    },
    {
      icon: Globe,
      title: "Remote-First",
      description: "Work from anywhere with flexible hours and home office setup budget"
    },
    {
      icon: Users,
      title: "Great Team",
      description: "Collaborative culture with talented, passionate, and supportive colleagues"
    },
    {
      icon: Target,
      title: "Equity Package",
      description: "Competitive equity package so you can share in our success"
    },
    {
      icon: Clock,
      title: "Work-Life Balance",
      description: "Unlimited PTO, flexible schedules, and focus on sustainable work practices"
    }
  ];

  const values = [
    "User-centric approach to everything we build",
    "Continuous learning and improvement",
    "Transparency and open communication",
    "Diversity, equity, and inclusion",
    "Making a positive impact on careers and lives"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Join Our Team</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            Help us build the future of opportunity discovery. Work with passionate people 
            who are committed to making a difference in careers and education worldwide.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Why Work With Us */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Work With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                    <benefit.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Values */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Our Values</CardTitle>
            <CardDescription className="text-center text-lg">
              These principles guide everything we do at OpportunityHub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 max-w-3xl mx-auto">
              {values.map((value, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{position.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">{position.department}</Badge>
                        <Badge variant="outline">{position.type}</Badge>
                      </div>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{position.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {position.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {position.salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {position.type}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Requirements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {position.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Our Hiring Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Application</h3>
                <p className="text-sm text-gray-600">Submit your application with resume and cover letter</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Phone Screen</h3>
                <p className="text-sm text-gray-600">Initial conversation with our recruiting team</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Technical/Case Study</h3>
                <p className="text-sm text-gray-600">Role-specific assessment or presentation</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Final Interview</h3>
                <p className="text-sm text-gray-600">Meet the team and cultural fit assessment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Don't See Your Role?</h2>
            <p className="text-xl mb-6 opacity-90">
              We're always looking for talented people. Send us your resume and tell us 
              how you'd like to contribute to our mission.
            </p>
            <Button variant="secondary" size="lg">
              Send Us Your Resume
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Careers;
