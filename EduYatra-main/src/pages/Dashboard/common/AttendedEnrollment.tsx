
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Award, Calendar, Clock, Search, Download, Star } from "lucide-react";

const AttendedEnrollment = () => {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Completed Enrollments
            </h1>
            <p className="text-muted-foreground mt-2">Review your completed courses and achievements</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Download className="h-4 w-4 mr-2" />
            Export Certificates
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="glass-effect border-primary/20 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search completed courses..." className="pl-10" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Summary */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { title: "Courses Completed", value: "12", icon: Award },
            { title: "Certificates Earned", value: "8", icon: Award },
            { title: "Total Study Hours", value: "145h", icon: Clock },
            { title: "Average Rating", value: "4.8", icon: Star },
          ].map((stat, index) => (
            <Card key={stat.title} className="glass-effect border-primary/20 animate-scale-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completed Courses */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Basic Mathematics",
              instructor: "Dr. John Smith",
              completedDate: "Nov 15, 2024",
              duration: "6 weeks",
              grade: "A+",
              rating: 5,
              certificate: true,
              category: "Mathematics"
            },
            {
              title: "Introduction to Physics",
              instructor: "Prof. Lisa Anderson",
              completedDate: "Oct 28, 2024",
              duration: "8 weeks",
              grade: "A",
              rating: 4.8,
              certificate: true,
              category: "Physics"
            },
            {
              title: "Chemistry Fundamentals",
              instructor: "Dr. Mark Taylor",
              completedDate: "Oct 10, 2024",
              duration: "5 weeks",
              grade: "B+",
              rating: 4.5,
              certificate: false,
              category: "Chemistry"
            },
            {
              title: "Cell Biology",
              instructor: "Dr. Janet Wilson",
              completedDate: "Sep 22, 2024",
              duration: "7 weeks",
              grade: "A-",
              rating: 4.9,
              certificate: true,
              category: "Biology"
            },
            {
              title: "Algebra Mastery",
              instructor: "Prof. David Lee",
              completedDate: "Sep 5, 2024",
              duration: "4 weeks",
              grade: "A+",
              rating: 5,
              certificate: true,
              category: "Mathematics"
            },
            {
              title: "Organic Chemistry Basics",
              instructor: "Dr. Sarah Brown",
              completedDate: "Aug 18, 2024",
              duration: "6 weeks",
              grade: "B",
              rating: 4.2,
              certificate: false,
              category: "Chemistry"
            }
          ].map((course, index) => (
            <Card key={course.title} className="glass-effect border-primary/20 animate-scale-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <Badge variant={course.grade.startsWith('A') ? 'default' : 'secondary'}>
                    {course.grade}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-accent/20 p-3 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-medium">{course.completedDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(course.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">({course.rating})</span>
                    </div>
                    {course.certificate && (
                      <Badge className="bg-green-500 text-white">
                        <Award className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      View Details
                    </Button>
                    {course.certificate && (
                      <Button variant="default" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Achievements */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { achievement: "Mathematics Expert", desc: "Completed 3 advanced math courses", date: "Nov 15, 2024", type: "Course Completion" },
                { achievement: "Perfect Score", desc: "Scored 100% in Basic Mathematics final exam", date: "Nov 10, 2024", type: "Academic Excellence" },
                { achievement: "Speed Learner", desc: "Completed Cell Biology course in record time", date: "Sep 22, 2024", type: "Learning Milestone" },
                { achievement: "Consistent Learner", desc: "Maintained 90%+ attendance across all courses", date: "Sep 1, 2024", type: "Attendance" },
              ].map((achievement, index) => (
                <div key={achievement.achievement} className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/20 transition-colors animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center gap-4">
                    <Award className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="font-medium">{achievement.achievement}</p>
                      <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{achievement.type}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AttendedEnrollment;
