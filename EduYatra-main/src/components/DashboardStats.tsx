
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  delay?: number;
}

const StatCard = ({ title, value, change, icon, delay = 0 }: StatCardProps) => (
  <Card className="hover-lift glass-effect animate-scale-in border-primary/20 hover:border-primary/40 transition-all duration-300" style={{ animationDelay: `${delay}ms` }}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center">
        <span className="text-lg">{icon}</span>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        {value}
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        {change}
      </p>
    </CardContent>
  </Card>
);

export function DashboardStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value="2,847"
        change="+12% from last month"
        icon="👥"
        delay={0}
      />
      <StatCard
        title="Active Tests"
        value="42"
        change="+3 new tests this week"
        icon="📝"
        delay={100}
      />
      <StatCard
        title="Avg Score"
        value="78.5%"
        change="+2.1% from last month"
        icon="📊"
        delay={200}
      />
      <StatCard
        title="Completion Rate"
        value="92.3%"
        change="+5.2% from last month"
        icon="✅"
        delay={300}
      />
    </div>
  );
}
