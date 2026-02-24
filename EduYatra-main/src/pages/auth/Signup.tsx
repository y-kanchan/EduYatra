import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { User, ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";
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

interface SignupResponse {
  token: string;
  role: string;
  isSuperAdmin?: boolean;
}

interface Institute {
  _id: string;
  name: string;
  location?: string;
}

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    grade: "",
    subject: "",
    school: "",
    adminCode: "",
    institution: "",
    institute: "",
  });
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [institutesLoading, setInstitutesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Fetch institutes on component mount
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/institutes`);
        if (response.data.success && response.data.institutes.length > 0) {
          setInstitutes(response.data.institutes);
        } else {
          // Fallback to default institutes if none found
          console.warn('No institutes found in database, using defaults');
          setInstitutes([
            { _id: '1', name: 'SRMAP', location: 'Mangalagiri, AP' },
            { _id: '2', name: 'VIT AP', location: 'Amaravati, AP' },
            { _id: '3', name: 'SRM KTR', location: 'Kattankulathur, TN' },
            { _id: '4', name: 'KLU', location: 'Vaddeswaram, AP' }
          ]);
        }
      } catch (error: any) {
        console.error('Error fetching institutes:', error);
        // Fallback to default institutes on error
        console.warn('Using default institutes due to fetch error');
        setInstitutes([
          { _id: '1', name: 'SRMAP', location: 'Mangalagiri, AP' },
          { _id: '2', name: 'VIT AP', location: 'Amaravati, AP' },
          { _id: '3', name: 'SRM KTR', location: 'Kattankulathur, TN' },
          { _id: '4', name: 'KLU', location: 'Vaddeswaram, AP' }
        ]);
      } finally {
        setInstitutesLoading(false);
      }
    };
    fetchInstitutes();
  }, []);
  const [emailError, setEmailError] = useState("");

  const validateGmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setEmailError(value && !validateGmail(value) ? "Please enter a valid Gmail address (example@gmail.com)" : "");
    }

    if (name === "password") {
      setPasswordValidation(validatePassword(value));
    }
  };

  const isPasswordValid = () => Object.values(passwordValidation).every(Boolean);

  const isFormValid = () =>
    formData.fullName &&
    formData.email &&
    validateGmail(formData.email) &&
    formData.password &&
    isPasswordValid() &&
    formData.password === formData.confirmPassword &&
    formData.role &&
    formData.institute &&
    (formData.role !== "student" || formData.grade) &&
    (formData.role !== "teacher" || formData.subject) &&
    (formData.role !== "admin" || formData.adminCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateGmail(formData.email)) {
      toast.error("❌ Please enter a valid Gmail address");
      return;
    }

    if (!isPasswordValid()) {
      toast.error("❌ Please ensure your password meets all requirements");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("❌ Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post<SignupResponse>(`${API_URL}/users/signup`, formData);
      const { token, role, isSuperAdmin, permissions } = response.data;

      const decoded: any = jwtDecode(token);
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("isSuperAdmin", isSuperAdmin ? "true" : "false");
      localStorage.setItem("permissions", JSON.stringify(permissions || decoded.permissions || []));
      const userProfile: Profile = {
        name: decoded.fullName || formData.fullName,
        email: decoded.email || formData.email,
        bio: "",
        avatar: "/placeholder.svg",
        phone: "",
        department: "",
        ...(role === "student" ? { studentId: "", batch: "" } : { teacherId: "" }),
      };
      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      toast.success("✅ Account created successfully! Redirecting to dashboard...");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        grade: "",
        subject: "",
        school: "",
        adminCode: "",
        institution: "",
        institute: "",
      });
      setPasswordValidation({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });

      setTimeout(() => {
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
            window.location.href = "/signin";
        }
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.error || "⚠️ Server error during signup");
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${met ? "text-green-600" : "text-red-500"}`}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 sm:mb-6 transition-colors text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sign Up for Deskoros</h1>
            <p className="text-sm sm:text-base text-gray-600">Join thousands of learners achieving their goals</p>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Gmail Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={emailError ? "border-red-500 focus:ring-red-500" : ""}
                  required
                />
                {emailError && (
                  <p className="text-red-500 text-sm flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {emailError}
                  </p>
                )}
                {formData.email && !emailError && (
                  <p className="text-green-600 text-sm flex items-center">
                    <Check className="w-3 h-3 mr-1" />
                    Valid Gmail address
                  </p>
                )}
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
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="bg-gray-50 p-3 rounded-md space-y-1">
                    <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                    <PasswordRequirement met={passwordValidation.length} text="At least 8 characters" />
                    <PasswordRequirement met={passwordValidation.uppercase} text="One uppercase letter" />
                    <PasswordRequirement met={passwordValidation.lowercase} text="One lowercase letter" />
                    <PasswordRequirement met={passwordValidation.number} text="One number" />
                    <PasswordRequirement met={passwordValidation.special} text="One special character (!@#$%^&*)" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pr-10 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? "border-green-500 focus:ring-green-500"
                        : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="text-sm">
                    {formData.password === formData.confirmPassword ? (
                      <p className="text-green-600 flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Passwords match
                      </p>
                    ) : (
                      <p className="text-red-500 flex items-center">
                        <X className="w-3 h-3 mr-1" />
                        Passwords do not match
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institute">Institute</Label>
                <select
                  id="institute"
                  name="institute"
                  value={formData.institute}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={institutesLoading}
                >
                  <option value="">
                    {institutesLoading ? 'Loading institutes...' : 'Select your institute'}
                  </option>
                  {institutes.map((institute) => (
                    <option key={institute._id} value={institute.name}>
                      {institute.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.role === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade Level</Label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select your grade</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                    <option value="university">University</option>
                  </select>
                </div>
              )}

              {formData.role === "teacher" && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Name</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Enter your subject name"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {formData.role === "admin" && (
                <div className="space-y-2">
                  <Label htmlFor="adminCode">Admin Code</Label>
                  <Input
                    id="adminCode"
                    name="adminCode"
                    type="text"
                    placeholder="Enter admin code"
                    value={formData.adminCode}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500 flex items-center">
                    ℹ️ Super admin access code required. Contact system administrator if you don't have one.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full ${isFormValid() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                size="lg"
                disabled={loading || !isFormValid()}
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Already have an account?
                <a href="/signin" className="ml-1 text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
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

export default SignUp;