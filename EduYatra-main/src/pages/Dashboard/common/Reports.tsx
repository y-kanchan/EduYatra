import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, Filter } from "lucide-react";

const Reports = () => {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Reports
            </h1>
            <p className="text-muted-foreground mt-2">Generate and download detailed reports</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>

        {/* Report Categories */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Student Performance", desc: "Individual and class performance reports", icon: FileText },
            { title: "Test Analysis", desc: "Detailed test and exam analytics", icon: Calendar },
            { title: "Attendance Reports", desc: "Student attendance tracking", icon: Filter },
          ].map((category, index) => (
            <Card key={category.title} className="glass-effect border-primary/20 animate-scale-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{category.desc}</p>
                <Button variant="outline" className="w-full">Generate Report</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Monthly Performance Report - November 2024", date: "Dec 1, 2024", size: "2.3 MB" },
                { name: "Test Analysis - Mathematics Mid-term", date: "Nov 28, 2024", size: "1.8 MB" },
                { name: "Class Attendance Summary - Week 47", date: "Nov 25, 2024", size: "0.9 MB" },
                { name: "Student Progress Report - Grade 10", date: "Nov 22, 2024", size: "3.1 MB" },
              ].map((report, index) => (
                <div key={report.name} className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/20 transition-colors animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
