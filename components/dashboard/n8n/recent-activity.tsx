"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BusinessMetrics } from "@/types";
import { n8nClient } from "@/lib/n8n-client";

export function RecentActivity() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        // This would ideally come from an n8n workflow that aggregates AI insights
        // For now, we'll simulate fetching data or use a direct webhook trigger.
        const response = await n8nClient.triggerWebhook("get-ai-insights");
        const data = await response.json();
        setInsights(data.aiInsights || []);
      } catch (err) {
        console.error("Failed to fetch AI insights:", err);
        setError("Failed to load AI insights. Please check n8n connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
    const interval = setInterval(fetchInsights, 60000); // Refetch every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="col-span-3 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent AI Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse mr-4"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-3 text-center text-red-500 p-4 border border-red-500 rounded-md">
        {error}
      </Card>
    );
  }

  return (
    <Card className="col-span-3 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent AI Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold mr-4">
                    AI
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">
                      {insight}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()} - AI Generated
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No recent AI activity. Start your n8n workflows!</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}