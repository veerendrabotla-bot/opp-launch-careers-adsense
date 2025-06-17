
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Users } from 'lucide-react';

const Privacy = () => {
  const sections = [
    {
      title: "Information We Collect",
      icon: Eye,
      content: [
        "Account information (name, email address)",
        "Profile information you choose to provide",
        "Usage data and analytics",
        "Cookies and similar technologies",
        "Communications with our support team"
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Users,
      content: [
        "Provide and maintain our services",
        "Send you relevant opportunities and updates",
        "Improve our platform and user experience",
        "Respond to your inquiries and support requests",
        "Comply with legal obligations"
      ]
    },
    {
      title: "Data Security",
      icon: Lock,
      content: [
        "Industry-standard encryption for data transmission",
        "Secure servers with regular security updates",
        "Limited access to personal information",
        "Regular security audits and monitoring",
        "Incident response procedures"
      ]
    },
    {
      title: "Your Rights",
      icon: Shield,
      content: [
        "Access your personal data",
        "Correct inaccurate information",
        "Delete your account and data",
        "Export your data",
        "Opt-out of marketing communications"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">Your privacy is important to us. Here's how we protect and use your information.</p>
          <p className="text-sm text-gray-500 mt-4">Last updated: December 2024</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Commitment to Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              At OpportunityHub, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 mb-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <section.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to enhance your experience on our platform. These include:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Essential cookies for basic functionality</li>
              <li>• Analytics cookies to understand usage patterns</li>
              <li>• Preference cookies to remember your settings</li>
              <li>• Authentication cookies to keep you logged in</li>
            </ul>
            <p className="text-gray-600 mt-4">
              You can control cookie preferences through your browser settings.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We use trusted third-party services to provide our platform:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Supabase for authentication and database services</li>
              <li>• Analytics services for usage insights</li>
              <li>• Email services for notifications</li>
              <li>• Content delivery networks for performance</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p>Email: privacy@opportunityhub.com</p>
              <p>Address: 123 Innovation Drive, Tech City, TC 12345</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
