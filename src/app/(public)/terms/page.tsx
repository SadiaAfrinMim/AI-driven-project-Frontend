'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Calendar,
  Scale,
  Shield,
  Users,
  AlertTriangle
} from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = 'January 10, 2024';

  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing and using AI Product Suggester, you accept and agree to be bound by the terms and provision of this agreement.'
    },
    {
      title: 'User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
    },
    {
      title: 'Acceptable Use',
      content: 'You agree not to use the service for any unlawful purposes or to violate any laws in your jurisdiction.'
    },
    {
      title: 'Content Ownership',
      content: 'You retain ownership of content you create, but grant us license to use it for providing our AI-powered services.'
    },
    {
      title: 'Privacy & Data',
      content: 'Your privacy is protected under our Privacy Policy. We collect minimal data necessary for providing our services.'
    },
    {
      title: 'AI Services',
      content: 'Our AI recommendations are provided as-is. While we strive for accuracy, AI outputs may not always be perfect.'
    },
    {
      title: 'Limitation of Liability',
      content: 'Our service is provided "as is" without warranties. We are not liable for indirect damages or losses.'
    },
    {
      title: 'Termination',
      content: 'Either party may terminate this agreement at any time. Your data will be handled according to our Privacy Policy.'
    }
  ];

  const userResponsibilities = [
    'Provide accurate account information',
    'Maintain account security',
    'Use the service lawfully',
    'Respect other users and content',
    'Report inappropriate content'
  ];

  const prohibitedActivities = [
    'Violating intellectual property rights',
    'Posting harmful or illegal content',
    'Attempting to hack or compromise the service',
    'Creating fake accounts or manipulating reviews',
    'Using automated tools without permission'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-sky-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Legal Terms
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Please read these terms carefully before using our AI-powered product recommendation platform.
            </p>
            <div className="flex items-center justify-center mt-6 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Agreement Overview</h2>
              <p className="text-lg text-muted-foreground">
                These terms govern your use of AI Product Suggester's services and platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center">
                <CardHeader>
                  <Scale className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Fair & Transparent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Clear terms with no hidden clauses or unfair provisions
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">User Protection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Designed to protect user rights and data privacy
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Community Focused</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Terms that encourage positive community engagement
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Key Terms & Conditions</h2>
            <div className="space-y-6">
              {sections.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-3 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Responsibilities */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-500" />
                    Your Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {userResponsibilities.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                    Prohibited Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prohibitedActivities.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Download Terms */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">Download Complete Terms</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get the full legal document for your records or legal review.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Download className="mr-2 h-5 w-5" />
                Download PDF Version
              </Button>
              <Button variant="outline" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                View Full Document
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Questions */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">Questions About These Terms?</h3>
            <p className="text-muted-foreground mb-6">
              Contact our legal team if you have any questions or concerns about these terms.
            </p>
            <Button variant="outline" asChild>
              <a href="/contact">
                Contact Legal Team
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}