'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  FileText,
  Download,
  Mail,
  Calendar,
  Users,
  Lock,
  Eye
} from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = 'January 15, 2024';

  const sections = [
    {
      icon: Users,
      title: 'Information We Collect',
      content: [
        'Personal information you provide (name, email, profile data)',
        'Usage data and analytics from platform interactions',
        'AI-generated content and preferences for recommendations',
        'Device and browser information for security and optimization'
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        'Providing personalized AI-powered product recommendations',
        'Improving our AI algorithms and platform performance',
        'Communicating with you about your account and updates',
        'Ensuring platform security and preventing fraud'
      ]
    },
    {
      icon: Lock,
      title: 'Data Security & Privacy',
      content: [
        'End-to-end encryption for all data transmission',
        'Secure cloud storage with regular security audits',
        'Your data is never sold to third parties',
        'You have full control over your data and privacy settings'
      ]
    },
    {
      icon: Shield,
      title: 'Your Rights & Controls',
      content: [
        'Access, update, or delete your personal data anytime',
        'Opt-out of marketing communications',
        'Data portability - export your information',
        'Right to be forgotten - complete account deletion'
      ]
    }
  ];

  const policies = [
    {
      title: 'Privacy Policy',
      description: 'Complete details about how we collect, use, and protect your data.',
      lastUpdated: 'January 15, 2024',
      downloadUrl: '#'
    },
    {
      title: 'Terms of Service',
      description: 'Legal terms governing your use of our AI platform and services.',
      lastUpdated: 'January 10, 2024',
      downloadUrl: '#'
    },
    {
      title: 'Cookie Policy',
      description: 'Information about how we use cookies and tracking technologies.',
      lastUpdated: 'December 20, 2023',
      downloadUrl: '#'
    },
    {
      title: 'AI Ethics Policy',
      description: 'Our commitment to responsible AI development and usage.',
      lastUpdated: 'January 5, 2024',
      downloadUrl: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-sky-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Privacy & Legal
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Your Privacy Matters
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are committed to protecting your privacy and ensuring transparency in how we handle your data.
              Our AI-powered platform prioritizes your trust and security.
            </p>
            <div className="flex items-center justify-center mt-6 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Privacy-First AI Platform</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We believe that privacy and AI innovation can coexist. Our platform is designed with privacy-by-design
                principles, ensuring that your personal information is protected while you benefit from personalized AI recommendations.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-foreground">GDPR Compliant</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-foreground">End-to-End Encryption</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-foreground">No Data Selling</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-sky-100 dark:bg-sky-900 rounded-2xl p-8">
                <Shield className="h-20 w-20 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-center mb-2">Your Data, Your Control</h3>
                <p className="text-muted-foreground text-center text-sm">
                  You own your data. We provide tools to view, export, and delete your information anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How We Protect Your Privacy</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparency is key to building trust. Here's how we handle your data responsibly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-muted-foreground text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Documents */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Legal Documents</h2>
            <p className="text-lg text-muted-foreground">
              Download our complete legal documents and policies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((policy, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      {policy.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Updated {policy.lastUpdated}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {policy.description}
                  </p>
                  <Button variant="outline" className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact for Privacy Concerns */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">Questions About Privacy?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our privacy team is here to help. Contact us with any questions or concerns about your data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Privacy Team
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:privacy@ai-product-suggester.com">
                  <Mail className="mr-2 h-4 w-4" />
                  privacy@ai-product-suggester.com
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}