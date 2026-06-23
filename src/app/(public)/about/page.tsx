'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Users,
  Shield,
  Zap,
  Target,
  Award,
  Heart,
  Globe
} from 'lucide-react';

export default function AboutPage() {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former AI researcher at Google with 10+ years in machine learning.',
      avatar: 'SJ'
    },
    {
      name: 'Mike Chen',
      role: 'CTO & Co-Founder',
      bio: 'Full-stack developer with expertise in scalable systems and AI integration.',
      avatar: 'MC'
    },
    {
      name: 'Emily Davis',
      role: 'Head of AI',
      bio: 'PhD in Computer Science, specializing in recommendation systems and NLP.',
      avatar: 'ED'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We prioritize user privacy and data security in everything we do.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Constantly pushing boundaries with cutting-edge AI technology.'
    },
    {
      icon: Heart,
      title: 'User-Centric',
      description: 'Every feature is designed with our users\' needs in mind.'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Making AI-powered recommendations accessible to everyone.'
    }
  ];

  const stats = [
    { label: 'Users Served', value: '50,000+' },
    { label: 'AI Recommendations', value: '2M+' },
    { label: 'Countries Reached', value: '120+' },
    { label: 'Uptime', value: '99.9%' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-sky-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              About Us
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Revolutionizing Product Discovery with AI
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're on a mission to transform how people discover and purchase products through
              intelligent AI-powered recommendations and authentic community insights.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                In today's overwhelming marketplace, finding the perfect product shouldn't be a guessing game.
                Our AI-powered platform analyzes millions of data points to provide personalized recommendations
                that truly understand your needs and preferences.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary">Personalized AI</Badge>
                <Badge variant="secondary">Community-Driven</Badge>
                <Badge variant="secondary">Transparent Reviews</Badge>
                <Badge variant="secondary">Privacy-First</Badge>
              </div>
            </div>
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-sky-950 bg-neutral-950 shadow-lg group aspect-[4/3] w-full">
  
  {/* Pure Video Layer */}
  <video 
    src="/8937985-hd_1080_1920_30fps.mp4" 
    autoPlay 
    loop 
    muted 
    playsInline 
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
  />

  {/* Subtle Border Glow Effect on Hover (Optional but looks premium) */}
  <div className="absolute inset-0 border border-transparent group-hover:border-sky-500/30 rounded-2xl pointer-events-none transition-colors duration-300" />
</div>  </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passionate experts dedicated to revolutionizing product discovery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                    {member.avatar}
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-primary font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Join Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the future of intelligent product discovery. Whether you're a user, developer, or partner,
            there's a place for you in our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started Today
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}