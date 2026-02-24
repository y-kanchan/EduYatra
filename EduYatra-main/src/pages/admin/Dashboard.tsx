// frontend/src/pages/admin/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Users, School, FileQuestion, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { getDashboardStats, getAnalytics } from '../../lib/api/admin';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, analyticsData] = await Promise.all([
          getDashboardStats(),
          getAnalytics('30'),
        ]);
        setStats(statsData.stats);
        setAnalytics(analyticsData.analytics);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Students',
      value: stats?.users?.students || 0,
      icon: Users,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Teachers',
      value: stats?.users?.teachers || 0,
      icon: School,
      color: 'bg-purple-500',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Active Classes',
      value: stats?.classes || 0,
      icon: School,
      color: 'bg-yellow-500',
      trend: '+15%',
      trendUp: true,
    },
    {
      title: 'Total Exams',
      value: stats?.exams || 0,
      icon: FileQuestion,
      color: 'bg-red-500',
      trend: '+20%',
      trendUp: true,
    },
    {
      title: 'Active Subscriptions',
      value: stats?.subscriptions || 0,
      icon: CreditCard,
      color: 'bg-indigo-500',
      trend: '-3%',
      trendUp: false,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="glass-effect rounded-xl border border-primary/10 p-4 sm:p-6 hover:border-primary/30 transition-all animate-slide-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{card.title}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-2">{card.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {card.trendUp ? (
                    <TrendingUp className="text-green-500 dark:text-green-400" size={14} />
                  ) : (
                    <TrendingDown className="text-red-500 dark:text-red-400" size={14} />
                  )}
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      card.trendUp ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {card.trend}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">vs last month</span>
                </div>
              </div>
              <div className={`${card.color} p-3 sm:p-4 rounded-full shadow-lg`}>
                <card.icon className="text-white" size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Analytics Summary */}
        <div className="glass-effect rounded-xl border border-primary/10 p-4 sm:p-6 animate-slide-in" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Last 30 Days Analytics
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <span className="text-xs sm:text-sm text-muted-foreground">New Users</span>
              <span className="font-semibold text-sm sm:text-base text-foreground">{analytics?.newUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <span className="text-xs sm:text-sm text-muted-foreground">New Classes</span>
              <span className="font-semibold text-sm sm:text-base text-foreground">{analytics?.newClasses || 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <span className="text-xs sm:text-sm text-muted-foreground">Completed Exams</span>
              <span className="font-semibold text-sm sm:text-base text-foreground">{analytics?.completedExams || 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <span className="text-xs sm:text-sm text-muted-foreground">Active Users</span>
              <span className="font-semibold text-sm sm:text-base text-foreground">{analytics?.activeUsers || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-effect rounded-xl border border-primary/10 p-4 sm:p-6 animate-slide-in" style={{ animationDelay: '0.7s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Quick Actions
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <button className="w-full py-2 sm:py-3 px-4 text-sm sm:text-base bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md">
              Add New User
            </button>
            <button className="w-full py-2 sm:py-3 px-4 text-sm sm:text-base bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md">
              Create Class
            </button>
            <button className="w-full py-2 sm:py-3 px-4 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md">
              Upload Questions
            </button>
            <button className="w-full py-2 sm:py-3 px-4 text-sm sm:text-base bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md">
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="glass-effect rounded-xl border border-primary/10 p-4 sm:p-6 animate-slide-in" style={{ animationDelay: '0.8s' }}>
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          System Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full shadow-lg shadow-green-500/50"></div>
            <span className="text-xs sm:text-sm text-muted-foreground">Server: <span className="font-semibold text-foreground">Operational</span></span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full shadow-lg shadow-green-500/50"></div>
            <span className="text-xs sm:text-sm text-muted-foreground">Database: <span className="font-semibold text-foreground">Healthy</span></span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50"></div>
            <span className="text-xs sm:text-sm text-muted-foreground">API: <span className="font-semibold text-foreground">Moderate</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
