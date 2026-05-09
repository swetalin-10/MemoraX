import React, { useState, useEffect } from "react";
import Spinner, { SkeletonStatCard, SkeletonCardGrid } from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  Clock,
  Trophy,
} from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import AnalyticsCard from "../../components/dashboard/AnalyticsCard";
import ActivityChart from "../../components/dashboard/ActivityChart";
import QuizPerformanceChart from "../../components/dashboard/QuizPerformanceChart";
import FlashcardPieChart from "../../components/dashboard/FlashcardPieChart";
import WeeklyConsistencyChart from "../../components/dashboard/WeeklyConsistencyChart";
import { chartTheme } from "../../components/dashboard/chartTheme";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        setDashboardData(data.data);
      } catch (_error) {
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="skeleton-line w-48 h-8" />
          <div className="skeleton-line w-64 h-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <SkeletonCardGrid count={3} cols="grid-cols-1 lg:grid-cols-3" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 flex items-center justify-center">
          <BrainCircuit className="w-6 h-6 text-neutral-500" />
        </div>
        <p className="text-neutral-500 text-sm">
          No dashboard data available
        </p>
      </div>
    );
  }

  const analyticsStats = [
    {
      title: "Total Documents",
      value: dashboardData.totalDocuments || 0,
      icon: <FileText className="w-5 h-5" />,
      accentColor: chartTheme.colors.primary,
    },
    {
      title: "Total Flashcards",
      value: dashboardData.totalFlashcards || 0,
      icon: <BookOpen className="w-5 h-5" />,
      accentColor: chartTheme.colors.secondary,
    },
    {
      title: "Total Quizzes",
      value: dashboardData.totalQuizzes || 0,
      icon: <BrainCircuit className="w-5 h-5" />,
      accentColor: chartTheme.colors.tertiary,
    },
    {
      title: "Average Score",
      value: `${dashboardData.averageScore || 0}%`,
      icon: <Trophy className="w-5 h-5" />,
      accentColor: chartTheme.colors.success,
    },
  ];

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "No date available";
    const diffInSeconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return "Yesterday";
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-neutral-400 mt-1.5 text-sm">
          Track your learning progress and insights
        </p>
      </div>

      {/* Row 1: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
        {analyticsStats.map((stat, index) => (
          <div key={stat.title} style={{ animationDelay: `${index * 60}ms` }} className="animate-fadeIn">
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              accentColor={stat.accentColor}
            />
          </div>
        ))}
      </div>

      {/* Row 2: Study Activity (larger) & Quiz Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2">
          <ActivityChart data={dashboardData.studyActivity} />
        </div>

        <AnalyticsCard title="Quiz Performance" subtitle="Score per attempt" className="lg:col-span-1" height="h-64 sm:h-80">
          <QuizPerformanceChart data={dashboardData.quizPerformance} />
        </AnalyticsCard>
      </div>

      {/* Row 3: Flashcard Mastery & Weekly Consistency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <AnalyticsCard title="Flashcard Mastery">
          <FlashcardPieChart data={dashboardData.flashcardStats} />
        </AnalyticsCard>

        <AnalyticsCard title="Weekly Consistency" subtitle="Sessions per day" allowOverflow>
          <WeeklyConsistencyChart data={dashboardData.weeklyConsistency} />
        </AnalyticsCard>
      </div>

      {/* Recent Activity */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
            <Clock className="w-5 h-5 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
            <p className="text-xs text-neutral-500">Your latest interactions</p>
          </div>
        </div>

        {dashboardData?.recentActivity?.documents?.length > 0 ||
        dashboardData?.recentActivity?.quizzes?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ...(dashboardData.recentActivity.documents || []).map(
                (doc) => ({
                  id: doc._id,
                  description: doc.title,
                  timestamp: doc.lastAccessed,
                  link: `/documents/${doc._id}`,
                  type: "document",
                })
              ),
              ...(dashboardData.recentActivity.quizzes || []).map((quiz) => ({
                id: quiz._id,
                description: quiz.title,
                timestamp: quiz.lastAccessed,
                link: `/quizzes/${quiz._id}`,
                type: "quiz",
              })),
            ]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 6)
              .map((activity, index) => (
                <a
                  key={activity.id || index}
                  href={activity.link}
                  className="group flex flex-col p-4 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800/80 transition-all duration-200 hover:border-neutral-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 rounded-lg bg-neutral-800 text-neutral-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors duration-200">
                      {activity.type === "document" ? <FileText size={18} /> : <BrainCircuit size={18} />}
                    </div>
                    <span className="text-[11px] font-medium text-neutral-500">
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-0.5 truncate">
                      {activity.description}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {activity.type === "document" ? "Accessed Document" : "Attempted Quiz"}
                    </p>
                  </div>
                </a>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-neutral-500" />
            </div>
            <p className="text-sm text-neutral-400 font-medium mb-1">No recent activity</p>
            <p className="text-xs text-neutral-500">Start studying to see your activity here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;