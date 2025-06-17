
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Zap, Heart, Award, Globe } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We're committed to democratizing access to opportunities for everyone."
    },
    {
      icon: Users,
      title: "Community-First",
      description: "Our platform thrives on the contributions and engagement of our users."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge technology."
    },
    {
      icon: Heart,
      title: "Empathy",
      description: "We understand the challenges of finding the right opportunities."
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Opportunities Listed", value: "10K+", icon: Target },
    { label: "Success Stories", value: "5K+", icon: Award },
    { label: "Countries Served", value: "25+", icon: Globe }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Former tech recruiter passionate about connecting talent with opportunities.",
      image: "/placeholder.svg"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Full-stack engineer with expertise in AI and scalable systems.",
      image: "/placeholder.svg"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      bio: "UX designer focused on creating intuitive user experiences.",
      image: "/placeholder.svg"
    },
    {
      name: "David Kim",
      role: "Head of Operations",
      bio: "Operations expert ensuring smooth platform functionality.",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About OpportunityHub</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            We're on a mission to connect ambitious individuals with life-changing opportunities. 
            Our platform makes it easier than ever to discover internships, contests, events, and scholarships.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="text-gray-600 space-y-4 text-lg leading-relaxed">
              <p>
                OpportunityHub was born from a simple observation: talented individuals often miss out on 
                life-changing opportunities simply because they don't know they exist. In 2023, our founding 
                team came together with a shared vision to solve this problem.
              </p>
              <p>
                We started by creating a centralized platform where users could discover and apply to 
                various opportunities. But we didn't stop there. We integrated AI-powered tools to help 
                users tailor their applications and introduced community features to foster collaboration.
              </p>
              <p>
                Today, OpportunityHub serves thousands of users worldwide, connecting them with internships, 
                contests, scholarships, and events that align with their goals and interests. We're proud 
                to be part of so many success stories.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                    <value.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <Badge variant="secondary" className="mb-3">{member.role}</Badge>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl mb-6 opacity-90">
              Ready to discover your next opportunity? Join thousands of ambitious individuals 
              who trust OpportunityHub to advance their careers.
            </p>
            <div className="space-x-4">
              <Badge variant="secondary" className="text-blue-600">Free to Join</Badge>
              <Badge variant="secondary" className="text-blue-600">AI-Powered</Badge>
              <Badge variant="secondary" className="text-blue-600">Community-Driven</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
