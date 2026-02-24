// frontend/src/pages/admin/Subscriptions.tsx
import React, { useState } from 'react';
import { CreditCard, TrendingUp, Users, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import {
  AdminPageLayout,
  AdminPageHeader,
  AdminFilterSection,
  AdminSearchInput,
  AdminCard,
  AdminBadge,
} from '../../components/admin';

const Subscriptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'transactions'>('overview');
  const [search, setSearch] = useState('');

  // Mock data - replace with actual API calls
  const stats = {
    totalRevenue: 125000,
    activeSubscriptions: 450,
    monthlyGrowth: 12.5,
    churnRate: 3.2,
  };

  const plans = [
    {
      id: 1,
      name: 'Basic Plan',
      price: 99,
      interval: 'month',
      features: ['Up to 50 students', 'Basic analytics', 'Email support'],
      subscribers: 120,
      revenue: 11880,
      active: true,
    },
    {
      id: 2,
      name: 'Pro Plan',
      price: 299,
      interval: 'month',
      features: ['Up to 200 students', 'Advanced analytics', 'Priority support', 'Custom branding'],
      subscribers: 85,
      revenue: 25415,
      active: true,
    },
    {
      id: 3,
      name: 'Enterprise Plan',
      price: 999,
      interval: 'month',
      features: ['Unlimited students', 'Full analytics suite', '24/7 support', 'Custom integrations', 'Dedicated account manager'],
      subscribers: 15,
      revenue: 14985,
      active: true,
    },
  ];

  const transactions = [
    {
      id: 1,
      user: 'John Doe',
      email: 'john@example.com',
      plan: 'Pro Plan',
      amount: 299,
      status: 'completed',
      date: '2026-01-10',
    },
    {
      id: 2,
      user: 'Jane Smith',
      email: 'jane@example.com',
      plan: 'Basic Plan',
      amount: 99,
      status: 'completed',
      date: '2026-01-09',
    },
    {
      id: 3,
      user: 'Acme Corp',
      email: 'admin@acme.com',
      plan: 'Enterprise Plan',
      amount: 999,
      status: 'pending',
      date: '2026-01-08',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions & Billing</h1>
        <p className="text-gray-600 mt-1">Manage subscription plans and billing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+{stats.monthlyGrowth}% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Across all plans</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Growth</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyGrowth}%</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">Trending up</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.churnRate}%</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'plans'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'transactions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Subscription Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">
                      ${plan.price}
                      <span className="text-sm text-gray-500">/{plan.interval}</span>
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subscribers:</span>
                        <span className="font-medium">{plan.subscribers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monthly Revenue:</span>
                        <span className="font-medium">${plan.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Manage Plans</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Create New Plan
                </button>
              </div>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                          {plan.active ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Inactive</span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-indigo-600 mt-2">
                          ${plan.price} <span className="text-sm text-gray-500">per {plan.interval}</span>
                        </p>
                        <ul className="mt-4 space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          Edit
                        </button>
                        <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{transaction.user}</div>
                        <div className="text-sm text-gray-500">{transaction.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.plan}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">${transaction.amount}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{transaction.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
