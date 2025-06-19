"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { n8nClient } from "@/lib/n8n-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function QuickActions() {
  const router = useRouter();

  const handleAction = async (webhookPath: string, successMessage: string, redirectPath?: string) => {
    try {
      toast.info(`Initiating ${successMessage.toLowerCase()}...`);
      await n8nClient.triggerWebhook(webhookPath);
      toast.success(successMessage);
      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error(`Failed to trigger ${webhookPath} webhook:`, error);
      toast.error(`Failed to ${successMessage.toLowerCase()}. Please check n8n connection.`);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-auto gap-5">
        <Button 
          onClick={() => handleAction("generate-social-content", "Content generation started!")}
        >
          Generate Content
        </Button>
        <Button 
          onClick={() => handleAction("run-business-analysis", "Business analysis initiated!")}
        >
          Run Analysis
        </Button>
        <Button 
          onClick={() => handleAction("check-new-leads", "Checking for new leads...")}
        >
          Check Leads
        </Button>
        <Button 
          onClick={() => handleAction("start-web-scraper", "Web scraper started!", "/dashboard/scraper")}
        >
          Start Scraper
        </Button>
        <Button 
          onClick={() => handleAction("send-daily-report", "Daily report sent!")}
        >
          Send Daily Report
        </Button>
        <Button 
          onClick={() => handleAction("optimize-campaigns", "Campaign optimization initiated!")}
        >
          Optimize Campaigns
        </Button>
      </CardContent>
    </Card>
  );
}