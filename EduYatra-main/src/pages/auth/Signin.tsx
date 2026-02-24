import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "@/config/api";

interface Profile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  phone: string;
  department: string;
  studentId?: string;
  batch?: string;
  teacherId?: string;
}

interface LoginResponse {
  token: string;
  role: string;
  isSuperAdmin?: boolean;
}

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/users/login`, formData);
      const { token, role, isSuperAdmin, permissions } = response.data;

      const decoded: any = jwtDecode(token);
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("isSuperAdmin", isSuperAdmin ? "true" : "false");
      localStorage.setItem("permissions", JSON.stringify(permissions || decoded.permissions || []));
      const userProfile: Profile = {
        name: decoded.fullName || "Unknown User",
        email: decoded.email || formData.email,
        bio: "",
        avatar: "/placeholder.svg",
        phone: "",
        department: "",
        ...(role === "student" ? { studentId: "", batch: "" } : { teacherId: "" }),
      };
      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      toast.success("✅ Login successful!");
      switch (role) {
        case "teacher":
          window.location.href = "/teacher";
          break;
        case "student":
          window.location.href = "/student";
          break;
        case "admin":
        case "superadmin":
          window.location.href = "/admin";
          break;
        default:
          toast.error("❌ Unknown role. Redirect failed.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.error || "⚠️ Server error during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <a
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Login to Deskoros</h1>
            <p className="text-sm sm:text-base text-gray-600">Welcome back! Access your learning dashboard</p>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot your password?
              </a>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Don't have an account?
                <a href="/signup" className="ml-1 text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </a>
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

export default SignIn;