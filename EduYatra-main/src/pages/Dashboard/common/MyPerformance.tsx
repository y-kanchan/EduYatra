
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, Target, Clock, Calendar } from "lucide-react";

const MyPerformance = () => {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              My Performance
            </h1>
            <p className="text-muted-foreground mt-2">Track your learning progress and achievements</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Overall Average", value: "88.5%", icon: TrendingUp, color: "text-green-600" },
            { title: "Tests Completed", value: "24", icon: Award, color: "text-blue-600" },
            { title: "Current Streak", value: "7 days", icon: Target, color: "text-purple-600" },
            { title: "Study Time", value: "45h", icon: Clock, color: "text-orange-600" },
          ].map((stat, index) => (
            <Card key={stat.title} className="glass-effect border-primary/20 animate-scale-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subject Performance */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { subject: "Mathematics", average: 92, tests: 8, improvement: "+5%", color: "bg-blue-500" },
                { subject: "Physics", average: 85, tests: 6, improvement: "+3%", color: "bg-green-500" },
                { subject: "Chemistry", average: 89, tests: 5, improvement: "+7%", color: "bg-purple-500" },
                { subject: "Biology", average: 87, tests: 5, improvement: "+2%", color: "bg-orange-500" },
              ].map((subject, index) => (
                <div key={subject.subject} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${subject.color}`}></div>
                      <span className="font-medium">{subject.subject}</span>
                      <Badge variant="outline">{subject.tests} tests</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-green-600 font-medium">{subject.improvement}</span>
                      <span className="font-bold text-primary">{subject.average}%</span>
                    </div>
                  </div>
                  <Progress value={subject.average} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { test: "Chemistry Lab Test", score: 94, date: "Dec 8, 2024", grade: "A" },
                  { test: "Mathematics Quiz", score: 89, date: "Dec 6, 2024", grade: "B+" },
                  { test: "Physics Assignment", score: 92, date: "Dec 4, 2024", grade: "A-" },
                  { test: "Biology Test", score: 87, date: "Dec 2, 2024", grade: "B+" },
                ].map((result, index) => (
                  <div key={result.test} className="flex justify-between items-center p-3 border rounded-lg animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div>
                      <p className="font-medium">{result.test}</p>
                      <p className="text-sm text-muted-foreground">{result.date}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={result.score >= 90 ? 'default' : 'secondary'}>{result.grade}</Badge>
                      <p className="text-sm font-bold text-primary">{result.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
            <CardHeader>
              <CardTitle>Study Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">7</div>
                  <p className="text-muted-foreground">Days in a row</p>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded ${
                        i < 7 ? 'bg-primary' : 'bg-muted'
                      } flex items-center justify-center text-xs font-medium text-white`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Today's Progress</span>
                    <span>3/4 completed</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals & Achievements */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Goals & Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Math Master", desc: "Score 90+ in 5 math tests", progress: 4, target: 5, achieved: false },
                { title: "Perfect Week", desc: "Complete all daily tasks for a week", progress: 7, target: 7, achieved: true },
                { title: "Science Explorer", desc: "Complete 10 science topics", progress: 7, target: 10, achieved: false },
              ].map((goal, index) => (
                <Card key={goal.title} className={`border-2 ${goal.achieved ? 'border-green-200 bg-green-50/20' : 'border-blue-200 bg-blue-50/20'} animate-scale-in`} style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className={`h-5 w-5 ${goal.achieved ? 'text-green-500' : 'text-blue-500'}`} />
                      <h3 className="font-medium">{goal.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{goal.desc}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.progress}/{goal.target}</span>
                      </div>
                      <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                    </div>
                    {goal.achieved && (
                      <Badge className="mt-2 bg-green-500">Completed!</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MyPerformance;
