import { Sun, Moon, User, Bell, Settings, Edit, Eye, Save, X, Camera, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface TopNavigationProps {
  role?: "student" | "teacher";
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

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

interface UpdateProfileResponse {
  token: string;
  user: {
    fullName: string;
    email: string;
    bio?: string;
    avatar?: string;
    phone?: string;
    department?: string;
    studentId?: string;
    batch?: string;
    teacherId?: string;
  };
}

function ProfileDialog({ profile, setProfile, role }: { profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>>; role: "student" | "teacher" }) {
  const [editForm, setEditForm] = useState<Profile>({
    name: profile.name,
    email: profile.email,
    bio: profile.bio,
    avatar: profile.avatar,
    phone: profile.phone,
    department: profile.department,
    studentId: profile.studentId || "",
    batch: profile.batch || "",
    teacherId: profile.teacherId || "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.put<UpdateProfileResponse>(
        `${API_URL}/users/profile`,
        {
          fullName: editForm.name,
          email: editForm.email,
          bio: editForm.bio,
          avatar: editForm.avatar,
          phone: editForm.phone,
          department: editForm.department,
          ...(role === "student" ? { studentId: editForm.studentId, batch: editForm.batch } : { teacherId: editForm.teacherId }),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { token: newToken, user } = response.data;
      localStorage.setItem("token", newToken);
      const updatedProfile: Profile = {
        name: user.fullName,
        email: user.email,
        bio: user.bio || "",
        avatar: user.avatar || "/placeholder.svg",
        phone: user.phone || "",
        department: user.department || "",
        ...(role === "student" ? { studentId: user.studentId || "", batch: user.batch || "" } : { teacherId: user.teacherId || "" }),
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

      setProfile(updatedProfile);
      setIsEditOpen(false);
      toast.success("✅ Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "⚠️ Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: profile.name,
      email: profile.email,
      bio: profile.bio,
      avatar: profile.avatar,
      phone: profile.phone,
      department: profile.department,
      studentId: profile.studentId || "",
      batch: profile.batch || "",
      teacherId: profile.teacherId || "",
    });
    setIsEditOpen(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditForm((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Eye className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-2">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {profile.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm">Phone</h4>
                <p className="text-sm text-muted-foreground">{profile.phone || "Not set"}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">{role === "teacher" ? "Teacher ID" : "Student ID"}</h4>
                <p className="text-sm text-muted-foreground">
                  {role === "teacher" ? profile.teacherId || "Not set" : profile.studentId || "Not set"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Department</h4>
                <p className="text-sm text-muted-foreground">{profile.department || "Not set"}</p>
              </div>
              {role === "student" && (
                <div>
                  <h4 className="font-medium text-sm">Batch</h4>
                  <p className="text-sm text-muted-foreground">{profile.batch || "Not set"}</p>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium mb-2">Bio</h4>
              <p className="text-sm text-muted-foreground">{profile.bio || "Not set"}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={editForm.avatar} alt={editForm.name} />
                  <AvatarFallback className="bg-primary/20 text-primary text-lg">
                    {editForm.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-3 w-3" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{role === "teacher" ? "Teacher ID" : "Student ID"}</Label>
                <Input
                  value={role === "teacher" ? editForm.teacherId : editForm.studentId}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      [role === "teacher" ? "teacherId" : "studentId"]: e.target.value,
                    }))
                  }
                  placeholder={`Enter ${role === "teacher" ? "teacher ID" : "student ID"}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Phone Number</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Department</Label>
                <Input
                  value={editForm.department}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter department"
                />
              </div>
              {role === "student" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Batch</Label>
                  <Input
                    value={editForm.batch}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, batch: e.target.value }))}
                    placeholder="Enter batch year"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bio</Label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StudentTopNavigation({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen?: boolean; setMobileMenuOpen?: (open: boolean) => void }) {
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<Profile>(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) return JSON.parse(savedProfile);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return {
          name: decoded.fullName || "John Doe",
          email: decoded.email || "john.doe@eduyatra.com",
          bio: "",
          avatar: "/placeholder.svg",
          phone: "",
          department: "",
          studentId: "",
          batch: "",
        };
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    return {
      name: "John Doe",
      email: "john.doe@eduyatra.com",
      bio: "Passionate student and lifelong learner.",
      avatar: "/placeholder.svg",
      phone: "",
      department: "",
      studentId: "",
      batch: "",
    };
  });

  return (
    <nav className="h-14 md:h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-3 md:px-6">
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8"
            onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="text-base md:text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Deskoros
          </div>
          <span className="hidden sm:block text-xs md:text-sm text-muted-foreground">Student Portal</span>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 h-8 w-8 md:h-10 md:w-10">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-primary/10 h-8 w-8 md:h-10 md:w-10"
          >
            {theme === "light" ? <Moon className="h-4 w-4 md:h-5 md:w-5" /> : <Sun className="h-4 w-4 md:h-5 md:w-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <User className="h-4 w-4 md:h-5 md:w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{profile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
              </div>
              <DropdownMenuSeparator />
              <ProfileDialog profile={profile} setProfile={setProfile} role="student" />
              <DropdownMenuItem asChild>
                <Link to="/student/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("userProfile");
                  localStorage.removeItem("role");
                  window.location.href = "/signin";
                }}
              >
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

function TeacherTopNavigation({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen?: boolean; setMobileMenuOpen?: (open: boolean) => void }) {
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<Profile>(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) return JSON.parse(savedProfile);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return {
          name: decoded.fullName || "Jane Smith",
          email: decoded.email || "jane.smith@eduyatra.com",
          bio: "",
          avatar: "/placeholder.svg",
          phone: "",
          department: "",
          teacherId: "",
        };
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    return {
      name: "Jane Smith",
      email: "jane.smith@eduyatra.com",
      bio: "Passionate educator and lifelong learner.",
      avatar: "/placeholder.svg",
      phone: "",
      department: "",
      teacherId: "",
    };
  });

  return (
    <nav className="h-14 md:h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-3 md:px-6">
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8"
            onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="text-base md:text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Deskoros
          </div>
          <span className="hidden sm:block text-xs md:text-sm text-muted-foreground">Teacher Dashboard</span>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 h-8 w-8 md:h-10 md:w-10">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-primary/10 h-8 w-8 md:h-10 md:w-10"
          >
            {theme === "light" ? <Moon className="h-4 w-4 md:h-5 md:w-5" /> : <Sun className="h-4 w-4 md:h-5 md:w-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <User className="h-4 w-4 md:h-5 md:w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{profile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
              </div>
              <DropdownMenuSeparator />
              <ProfileDialog profile={profile} setProfile={setProfile} role="teacher" />
              <DropdownMenuItem asChild>
                <Link to="/settings/general">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("userProfile");
                  localStorage.removeItem("role");
                  window.location.href = "/signin";
                }}
              >
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

export function TopNavigation({ role: propRole, mobileMenuOpen, setMobileMenuOpen }: TopNavigationProps) {
  const location = useLocation();
  const role = propRole || (location.pathname.startsWith("/student") ? "student" : "teacher");

  return role === "student" ? 
    <StudentTopNavigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} /> : 
    <TeacherTopNavigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />;
}