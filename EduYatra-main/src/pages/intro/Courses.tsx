// frontend/src/pages/intro/Courses.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, Database, Palette, Calculator, Globe, ArrowRight } from 'lucide-react';
import Navbar from './navbar';

const Courses = () => {
  const courses = [
    { icon: Calculator, title: 'Mathematics', description: 'From basics to advanced calculus and statistics', color: 'from-blue-500 to-cyan-500', courses: '250+ Courses' },
    { icon: Code, title: 'Programming', description: 'Learn coding from scratch to professional level', color: 'from-cyan-500 to-blue-600', courses: '180+ Courses' },
    { icon: Globe, title: 'Sciences', description: 'Physics, Chemistry, Biology comprehensive curriculum', color: 'from-blue-600 to-cyan-600', courses: '320+ Courses' },
    { icon: BookOpen, title: 'Languages', description: 'Master English, Hindi, and foreign languages', color: 'from-cyan-600 to-blue-500', courses: '150+ Courses' },
    { icon: Database, title: 'Engineering', description: 'Civil, Mechanical, Electrical engineering courses', color: 'from-blue-500 to-cyan-500', courses: '200+ Courses' },
    { icon: Palette, title: 'Arts & Design', description: 'Creative skills and design thinking courses', color: 'from-cyan-500 to-blue-600', courses: '120+ Courses' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">Courses</Badge>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                1000+ Courses
              </span>
              <br />
              <span className="text-gray-900">Across All Subjects</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert-designed curriculum covering all major subjects and competitive exams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {courses.map((course, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-cyan-50 group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${course.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <course.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <Badge variant="secondary" className="text-sm">{course.courses}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg rounded-xl">
                Browse All Courses <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
