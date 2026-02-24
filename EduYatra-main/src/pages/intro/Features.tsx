// frontend/src/pages/intro/Features.tsx - Deskoros Features Page
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Users, Award, Shield, Zap, Brain, Target, BarChart3,
  CheckCircle, Clock, Globe, Heart, Rocket, Star
} from 'lucide-react';
import Navbar from './navbar';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Intelligent recommendations and personalized learning paths powered by advanced AI algorithms',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Content',
      description: 'Vast library of courses, tests, and learning materials across all subjects',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Connect with peers, join study groups, and learn together in real-time',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Award,
      title: 'Smart Analytics',
      description: 'Detailed performance insights and progress tracking to optimize learning outcomes',
      color: 'from-cyan-600 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with encrypted data storage and secure authentication',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance ensures smooth experience even with slow internet',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and track learning goals with milestones and achievement rewards',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: BarChart3,
      title: 'Progress Reports',
      description: 'Comprehensive reports for students, teachers, and parents with actionable insights',
      color: 'from-cyan-600 to-blue-500'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access your learning materials anytime, anywhere, on any device',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Connect with learners and educators from around the world',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Heart,
      title: 'Student Wellbeing',
      description: 'Features designed to promote healthy learning habits and prevent burnout',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Rocket,
      title: 'Rapid Progress',
      description: 'Accelerate your learning journey with our proven methodology',
      color: 'from-cyan-600 to-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">Features</Badge>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
              <br />
              <span className="text-gray-900">For Modern Learning</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to create, manage, and excel in education, all in one platform.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden group"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl mb-8">Start your free trial today and see the difference.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl">
                Get Started Free
              </Button>
            </Link>
            <Link to="/contact-us">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

export default Features;
