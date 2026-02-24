
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  {
    id: 1,
    action: "New test created",
    subject: "Mathematics Chapter 5",
    time: "2 hours ago",
    user: "Teacher John",
    type: "create"
  },
  {
    id: 2,
    action: "Student completed exam",
    subject: "Physics Midterm",
    time: "4 hours ago",
    user: "Sarah Wilson",
    type: "complete"
  },
  {
    id: 3,
    action: "Question set reviewed",
    subject: "Chemistry Practice Set",
    time: "6 hours ago",
    user: "Dr. Smith",
    type: "review"
  },
  {
    id: 4,
    action: "Performance analysis generated",
    subject: "Class 10-A Monthly Report",
    time: "1 day ago",
    user: "System",
    type: "analysis"
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'create': return '✨';
    case 'complete': return '✅';
    case 'review': return '👁️';
    case 'analysis': return '📊';
    default: return '📌';
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'create': return 'bg-blue-500';
    case 'complete': return 'bg-green-500';
    case 'review': return 'bg-yellow-500';
    case 'analysis': return 'bg-purple-500';
    default: return 'bg-primary';
  }
};

export function RecentActivity() {
  return (
    <Card className="glass-effect border-primary/20 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">🕒</span>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-8 w-8 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center text-white shadow-lg`}>
                <span className="text-sm">{getActivityIcon(activity.type)}</span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.action}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.subject} • {activity.user}
                </p>
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
