import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";

const Analytics = () => {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-muted-foreground mt-2">Comprehensive data insights and performance metrics</p>
          </div>
        </div>

        {/* Analytics Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Students", value: "1,234", icon: Users, change: "+12%" },
            { title: "Test Completion Rate", value: "87%", icon: BarChart3, change: "+5%" },
            { title: "Average Score", value: "82.5", icon: TrendingUp, change: "+3.2%" },
            { title: "Active Courses", value: "24", icon: BookOpen, change: "+2%" },
          ].map((stat, index) => (
            <Card key={stat.title} className="glass-effect border-primary/20 animate-scale-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium">{stat.change} from last month</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-primary/30 rounded-xl bg-gradient-to-br from-accent/20 to-primary/5">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <p className="text-muted-foreground">Performance Chart</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
            <CardHeader>
              <CardTitle>Subject-wise Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { subject: "Mathematics", students: 342, avg: 85.2 },
                  { subject: "Physics", students: 298, avg: 78.9 },
                  { subject: "Chemistry", students: 256, avg: 82.1 },
                  { subject: "Biology", students: 189, avg: 88.5 },
                ].map((item, index) => (
                  <div key={item.subject} className="flex justify-between items-center p-3 border rounded-lg animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div>
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-muted-foreground">{item.students} students</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{item.avg}%</p>
                      <p className="text-xs text-muted-foreground">Average</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
