// frontend/src/pages/admin/Analytics.tsx
import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, BookOpen, FileQuestion, DollarSign } from 'lucide-react';
import { getAnalytics } from '../../lib/api/admin';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getAnalytics(period);
        setAnalytics(data.analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <AdminPageLayout>
      <AdminPageHeader
        title="Analytics & Reports"
        description="Comprehensive platform analytics and insights"
        action={
          <AdminSelect
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
              { value: '365', label: 'Last year' },
            ]}
          />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} />
            <TrendingUp size={24} />
          </div>
          <h3 className="text-sm font-medium opacity-90">New Users</h3>
          <p className="text-3xl font-bold mt-2">{analytics?.newUsers || 0}</p>
          <p className="text-sm mt-2 opacity-90">Last {period} days</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <BookOpen size={32} />
            <TrendingUp size={24} />
          </div>
          <h3 className="text-sm font-medium opacity-90">New Classes</h3>
          <p className="text-3xl font-bold mt-2">{analytics?.newClasses || 0}</p>
          <p className="text-sm mt-2 opacity-90">Last {period} days</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FileQuestion size={32} />
            <TrendingUp size={24} />
          </div>
          <h3 className="text-sm font-medium opacity-90">Completed Exams</h3>
          <p className="text-3xl font-bold mt-2">{analytics?.completedExams || 0}</p>
          <p className="text-sm mt-2 opacity-90">Last {period} days</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} />
            <TrendingUp size={24} />
          </div>
          <h3 className="text-sm font-medium opacity-90">Active Users</h3>
          <p className="text-3xl font-bold mt-2">{analytics?.activeUsers || 0}</p>
          <p className="text-sm mt-2 opacity-90">Last {period} days</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chart Placeholder - Integration with Chart.js or Recharts recommended
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Pie Chart Placeholder
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Classes</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">Class {i}</span>
                <span className="font-semibold text-gray-900">{100 - i * 5}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default Analytics;
