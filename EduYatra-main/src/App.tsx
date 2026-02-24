import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Root pages
import Index from "./pages/intro/Index";

//Intro
import Features from "./pages/intro/Features";
import Courses from "./pages/intro/Courses";
import Tutoring from "./pages/intro/Tutoring";
import Schools from "./pages/intro/Schools";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import StudentAuth from "./pages/auth/StudentAuth";
import TeacherAuth from "./pages/auth/TeacherAuth";
import AdminAuth from "./pages/auth/AdminAuth";

// Common pages
import TeacherIndex from "./pages/Dashboard/common/Index";
import AttendedEnrollment from "./pages/Dashboard/common/AttendedEnrollment";
import ConductTestOffline from "./pages/Dashboard/common/ConductTestOffline";
import ConductTestOnline from "./pages/Dashboard/common/ConductTestOnline";
import CreateQuestion from "./pages/Dashboard/common/CreateQuestion";
import Monitor from "./pages/Dashboard/common/monitor_test";
import GeneralSettings from "./pages/Dashboard/common/GeneralSettings";
import IndividualStudentAnalysis from "./pages/Dashboard/common/IndividualStudentAnalysis";
import ManageStudents from "./pages/Dashboard/common/ManageStudents";
import MyPerformance from "./pages/Dashboard/common/MyPerformance";
import NotFound from "./pages/Dashboard/common/NotFound";
import OngoingEnrollment from "./pages/Dashboard/common/OngoingEnrollment";
import OngoingTestExam from "./pages/Dashboard/common/OngoingTestExam";
import ReviewQuestionSets from "./pages/Dashboard/common/ReviewQuestionSets";
import TestExamAnalysis from "./pages/Dashboard/common/TestExamAnalysis";

// Student pages
import StudentIndex from "./pages/Dashboard/student/Index";
import Enrollment from "./pages/Dashboard/student/Enrollment";
import SettingsStudent from "./pages/Dashboard/student/Settings";
import LearnByTopic from "./pages/Dashboard/student/LearnByTopic";
import MyPerformanceStudent from "./pages/Dashboard/student/MyPerformance";
import PracticeExams from "./pages/Dashboard/student/PracticeExams";
import TestPage from "./pages/Dashboard/student/TestPage";
import ViewTestAnswers from "./pages/Dashboard/student/ViewTestAnswers";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Teachers from "./pages/admin/Teachers";
import Admins from "./pages/admin/Admins";
import Classes from "./pages/admin/Classes";
import Exams from "./pages/admin/Exams";
import QuestionBanks from "./pages/admin/QuestionBanks";
import Sliders from "./pages/admin/Sliders";
import Posters from "./pages/admin/Posters";
import Advertisements from "./pages/admin/Advertisements";
import Video from "./pages/admin/Video";
import Analytics from "./pages/admin/Analytics";
import Institutes from "./pages/admin/Institutes";
import Support from "./pages/admin/Support";
import Subscriptions from "./pages/admin/Subscriptions";
import Settings from "./pages/admin/Settings";
import AuditLogs from "./pages/admin/AuditLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/tutoring" element={<Tutoring />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/SIgnin" element={<Signin />} />
            <Route path="/SIgnup" element={<Signup />} />
            <Route path="/auth/student" element={<StudentAuth />} />
            <Route path="/auth/teacher" element={<TeacherAuth />} />
            <Route path="/auth/admin" element={<AdminAuth />} />
            <Route path="/teacher" element={<TeacherIndex/>} />
            <Route path="/conduct-test/online" element={<ConductTestOnline />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/monitor/:testId" element={<Monitor />} />
            <Route path="/dashboard/common/monitor/:testId" element={<Monitor />} />
            <Route path="/conduct-test/offline" element={<ConductTestOffline />} />
            <Route path="/questions/create" element={<CreateQuestion />} />
            <Route path="/questions/review" element={<ReviewQuestionSets />} />
            <Route path="/performance/analysis" element={<TestExamAnalysis />} />
            <Route path="/performance/individual" element={<IndividualStudentAnalysis />} />
            <Route path="/performance/ongoing" element={<OngoingTestExam />} />
            <Route path="/manage-students" element={<ManageStudents />} />
            <Route path="/teacher/test-answers/:submissionId" element={<ViewTestAnswers />} />
            <Route path="/student" element={<StudentIndex/>} />
            <Route path="/student/learn" element={<LearnByTopic />} />
            <Route path="/student/practice" element={<PracticeExams />} />
            <Route path="/student/performance" element={<MyPerformanceStudent />} />
            <Route path="/student/enrollment" element={<Enrollment />} />
            <Route path="/student/test-answers/:submissionId" element={<ViewTestAnswers />} />
            <Route path="/test" element={< TestPage />} />
            <Route path="/settings/general" element={<GeneralSettings />} />
            <Route path="/student/settings" element={<SettingsStudent />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="admins" element={<Admins />} />
              <Route path="classes" element={<Classes />} />
              <Route path="exams" element={<Exams />} />
              <Route path="question-banks" element={<QuestionBanks />} />
              <Route path="sliders" element={<Sliders />} />
              <Route path="posters" element={<Posters />} />
              <Route path="ads" element={<Advertisements />} />
              <Route path="video" element={<Video />} />
              <Route path="support" element={<Support />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="institutes" element={<Institutes />} />
              <Route path="settings" element={<Settings />} />
              <Route path="audit-logs" element={<AuditLogs />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;