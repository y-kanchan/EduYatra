// frontend/src/pages/intro/Tutoring.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Video, Calendar, MessageCircle, Award, Clock } from 'lucide-react';
import Navbar from './navbar';

const Tutoring = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">Tutoring</Badge>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                One-on-One
              </span>
              <br />
              <span className="text-gray-900">Expert Tutoring</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with expert tutors for personalized learning experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Expert Tutors', description: '5000+ verified tutors across all subjects', color: 'from-blue-500 to-cyan-500' },
              { icon: Video, title: 'Live Sessions', description: 'Interactive video classes with screen sharing', color: 'from-cyan-500 to-blue-600' },
              { icon: Calendar, title: 'Flexible Scheduling', description: 'Book sessions at your convenient time', color: 'from-blue-600 to-cyan-600' },
              { icon: MessageCircle, title: 'Chat Support', description: 'Get instant help through messaging', color: 'from-cyan-600 to-blue-500' },
              { icon: Award, title: 'Proven Results', description: '95% student satisfaction rate', color: 'from-blue-500 to-cyan-500' },
              { icon: Clock, title: '24/7 Availability', description: 'Find tutors available round the clock', color: 'from-cyan-500 to-blue-600' }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-cyan-50 group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg rounded-xl">
                Find Your Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tutoring;
