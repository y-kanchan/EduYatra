
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GraduationCap, ArrowLeft } from "lucide-react";

const TeacherAuth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? "Teacher Login" : "Teacher Sign Up"}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? "Welcome back! Manage your students and classes" 
                : "Join our community of dedicated educators"
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" type="text" placeholder="Enter your full name" />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm your password" />
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <select id="subject" className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select your subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                    <option value="history">History</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="school">School/Institution</Label>
                  <Input id="school" type="text" placeholder="Enter your school name" />
                </div>
              )}
              
              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            {isLogin && (
              <div className="text-center">
                <a href="#" className="text-sm text-green-600 hover:text-green-700">
                  Forgot your password?
                </a>
              </div>
            )}

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-green-600 hover:text-green-700 font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default TeacherAuth;
