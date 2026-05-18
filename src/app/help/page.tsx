'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Search,
  HelpCircle,
  MessageSquare,
  Book,
  Video,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: 'How does AI product recommendation work?',
      answer: 'Our AI analyzes your browsing history, reviews, and preferences to suggest products that match your interests. The system learns from your interactions to provide increasingly accurate recommendations over time.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption and security measures. Your personal data is never sold to third parties, and you have full control over your privacy settings.'
    },
    {
      question: 'How do I write a review?',
      answer: 'Navigate to any product page and click the "Write Review" button. You can rate the product from 1-5 stars and share your detailed experience.'
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account from the profile settings. This will permanently remove all your data from our systems.'
    },
    {
      question: 'How does the AI chat assistant work?',
      answer: 'Our AI assistant can help you find products, answer questions about our platform, and provide personalized recommendations based on your preferences.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We integrate with major payment processors. Specific payment methods depend on the marketplace you\'re shopping on through our platform.'
    }
  ];

  const helpCategories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of using our platform',
      articles: ['Creating an account', 'Setting up your profile', 'First product search']
    },
    {
      icon: MessageSquare,
      title: 'AI Features',
      description: 'Understanding our AI-powered tools',
      articles: ['AI recommendations', 'Chat assistant', 'Content generation']
    },
    {
      icon: HelpCircle,
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      articles: ['Login problems', 'Search not working', 'Account recovery']
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Visual guides for our features',
      articles: ['Platform overview', 'Advanced search', 'Review system']
    }
  ];

  const contactOptions = [
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team',
      availability: 'Mon-Fri, 9am-6pm',
      action: 'Start Chat'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      availability: '24/7 response within 24h',
      action: 'Send Email'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with an expert',
      availability: 'Mon-Fri, 10am-4pm',
      action: 'Call Now'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Help Center
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              How Can We Help You?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Find answers to common questions, get support, or contact our team for personalized assistance.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Browse Help Topics</h2>
            <p className="text-lg text-muted-foreground">
              Explore our comprehensive help resources
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.slice(0, 3).map((article, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="h-3 w-3 mr-2" />
                        {article}
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" className="w-full mt-4" size="sm">
                    View All Articles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Need More Help?</h2>
            <p className="text-lg text-muted-foreground">
              Our support team is here to help you succeed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <option.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-2">{option.description}</p>
                  <p className="text-xs text-muted-foreground">{option.availability}</p>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Quick Links</h3>
            <p className="text-muted-foreground">Find what you need quickly</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild>
              <a href="/contact">
                <ExternalLink className="mr-2 h-4 w-4" />
                Contact Form
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/about">
                <Book className="mr-2 h-4 w-4" />
                About Us
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/privacy">
                <HelpCircle className="mr-2 h-4 w-4" />
                Privacy Policy
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/blog">
                <Book className="mr-2 h-4 w-4" />
                Latest Updates
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}