"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { BusinessMetrics } from "@/types";
import { n8nClient } from "@/lib/n8n-client";

export function DashboardKPICards() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // In a real scenario, n8n would expose an API endpoint
        // that aggregates these metrics from various sources.
        // For now, we'll simulate fetching data or use a direct webhook trigger.

        // Example: Trigger an n8n workflow to get latest metrics
        // You would create an n8n workflow with a Webhook trigger that
        // gathers data and returns it as a Webhook Response.
        // Replace 'get-business-metrics' with your actual n8n webhook path.
        const response = await n8nClient.triggerWebhook("get-business-metrics");
        const data = await response.json();

        // Assuming the n8n webhook returns data in the BusinessMetrics format
        setMetrics(data as BusinessMetrics);
      } catch (err) {
        console.error("Failed to fetch business metrics:", err);
        setError("Failed to load business metrics. Please check n8n connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
    // You might want to refetch periodically
    const interval = setInterval(fetchMetrics, 60000); // Refetch every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="size-4 rounded-full bg-gray-700 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gray-700 h-8 w-3/4 rounded animate-pulse"></div>
              <p className="text-xs text-muted-foreground bg-gray-800 size-4 w-1/2 rounded mt-2 animate-pulse"></p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full text-center text-red-500 p-4 border border-red-500 rounded-md">
        {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="col-span-full text-center text-muted-foreground p-4">
        No metrics data available. Configure your n8n workflow to provide business insights.
      </div>
    );
  }

  const renderChange = (change: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-emerald-500" : "text-red-500";

    return (
      <div className={`flex items-center text-xs ${colorClass}`}>
        <Icon className="size-4 mr-1" />
        {Math.abs(change).toFixed(2)}%
      </div>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="size-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.revenue.current.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {renderChange(metrics.revenue.change)} from last month
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Generated</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="size-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{metrics.leads.current}</div>
          <p className="text-xs text-muted-foreground">
            {renderChange(metrics.leads.change)} from last month
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversions</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="size-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.conversions.current}</div>
          <p className="text-xs text-muted-foreground">
            {renderChange(metrics.conversions.change)} from last month
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="size-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeWorkflows}</div>
          <p className="text-xs text-muted-foreground">
            AI-powered automations running
          </p>
        </CardContent>
      </Card>
    </div>
  );
}