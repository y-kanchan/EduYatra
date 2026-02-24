
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? "Admin Login" : "Admin Sign Up"}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? "Secure access to your institution dashboard" 
                : "Register your institution with EduDojo"
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
                <Input id="email" type="email" placeholder="Enter your admin email" />
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
                  <Label htmlFor="institution">Institution Name</Label>
                  <Input id="institution" type="text" placeholder="Enter institution name" />
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="adminCode">Admin Code</Label>
                  <Input id="adminCode" type="text" placeholder="Enter admin verification code" />
                  <p className="text-xs text-gray-500">Contact support to get your admin verification code</p>
                </div>
              )}
              
              <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
                {isLogin ? "Sign In" : "Create Admin Account"}
              </Button>
            </form>

            {isLogin && (
              <div className="text-center">
                <a href="#" className="text-sm text-purple-600 hover:text-purple-700">
                  Forgot your password?
                </a>
              </div>
            )}

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                {isLogin ? "Need admin access?" : "Already have admin access?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
                >
                  {isLogin ? "Request access" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          Admin access is restricted and requires verification
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
