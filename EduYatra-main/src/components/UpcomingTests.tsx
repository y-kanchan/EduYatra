
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const upcomingTests = [
  {
    id: 1,
    title: "Mathematics Final Exam",
    class: "Grade 10-A",
    date: "2024-06-15",
    time: "10:00 AM",
    status: "scheduled",
  },
  {
    id: 2,
    title: "Physics Chapter Test",
    class: "Grade 11-B",
    date: "2024-06-16",
    time: "2:00 PM",
    status: "draft",
  },
  {
    id: 3,
    title: "Chemistry Lab Assessment",
    class: "Grade 12-A",
    date: "2024-06-18",
    time: "9:00 AM",
    status: "scheduled",
  },
];

export function UpcomingTests() {
  return (
    <Card className="glass-effect border-primary/20 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          Upcoming Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {upcomingTests.map((test, index) => (
            <div 
              key={test.id} 
              className="flex items-center justify-between space-x-4 p-4 border rounded-xl hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] animate-slide-in bg-gradient-to-r from-background to-accent/20"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-2 flex-1">
                <p className="text-sm font-semibold text-foreground">{test.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <span>🏫</span>
                    {test.class}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <span>📅</span>
                    {test.date}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <span>⏰</span>
                    {test.time}
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                  test.status === 'scheduled' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                  {test.status}
                </span>
                <Button size="sm" variant="outline" className="hover-lift">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
