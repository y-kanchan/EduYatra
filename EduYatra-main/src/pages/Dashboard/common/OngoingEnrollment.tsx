
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Users, Play, Calendar } from "lucide-react";

const OngoingEnrollment = () => {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Ongoing Enrollments
            </h1>
            <p className="text-muted-foreground mt-2">Continue your active courses and learning paths</p>
          </div>
        </div>

        {/* Active Courses */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Advanced Mathematics",
              instructor: "Dr. Sarah Johnson",
              progress: 65,
              nextClass: "Tomorrow 10:00 AM",
              totalLessons: 24,
              completedLessons: 16,
              duration: "8 weeks",
              category: "Mathematics"
            },
            {
              title: "Physics Fundamentals",
              instructor: "Prof. Michael Chen",
              progress: 45,
              nextClass: "Today 2:00 PM",
              totalLessons: 20,
              completedLessons: 9,
              duration: "6 weeks",
              category: "Physics"
            },
            {
              title: "Organic Chemistry",
              instructor: "Dr. Emily Davis",
              progress: 80,
              nextClass: "Dec 12, 9:00 AM",
              totalLessons: 18,
              completedLessons: 14,
              duration: "5 weeks",
              category: "Chemistry"
            },
            {
              title: "Biology Basics",
              instructor: "Dr. Robert Wilson",
              progress: 30,
              nextClass: "Dec 11, 11:00 AM",
              totalLessons: 22,
              completedLessons: 7,
              duration: "7 weeks",
              category: "Biology"
            }
          ].map((course, index) => (
            <Card key={course.title} className="glass-effect border-primary/20 animate-scale-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <Badge variant="default">{course.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">by {course.instructor}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{course.completedLessons}/{course.totalLessons} lessons</span>
                    </div>
                    <Progress value={course.progress} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
                  </div>
                  
                  <div className="bg-accent/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">Next Class:</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{course.nextClass}</p>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{course.totalLessons} lessons</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="default" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Continue
                    </Button>
                    <Button variant="outline" size="sm">
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Schedule */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "2:00 PM", course: "Physics Fundamentals", topic: "Newton's Laws", duration: "60 min", type: "Live Class" },
                { time: "4:00 PM", course: "Advanced Mathematics", topic: "Practice Session", duration: "45 min", type: "Study Group" },
                { time: "6:00 PM", course: "Organic Chemistry", topic: "Assignment Due", duration: "Submit", type: "Assignment" },
              ].map((item, index) => (
                <div key={item.time} className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/20 transition-colors animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center gap-4">
                    <div className="text-primary font-bold">{item.time}</div>
                    <div>
                      <p className="font-medium">{item.course}</p>
                      <p className="text-sm text-muted-foreground">{item.topic} • {item.duration}</p>
                    </div>
                  </div>
                  <Badge variant={item.type === 'Live Class' ? 'default' : item.type === 'Assignment' ? 'destructive' : 'secondary'}>
                    {item.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Study Statistics */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Weekly Study Hours", value: "18.5h", target: "20h", progress: 92.5 },
            { title: "Assignments Completed", value: "8/10", target: "10", progress: 80 },
            { title: "Live Classes Attended", value: "5/6", target: "6", progress: 83.3 },
          ].map((stat, index) => (
            <Card key={stat.title} className="glass-effect border-primary/20 animate-scale-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Target</span>
                      <span>{stat.target}</span>
                    </div>
                    <Progress value={stat.progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OngoingEnrollment;
