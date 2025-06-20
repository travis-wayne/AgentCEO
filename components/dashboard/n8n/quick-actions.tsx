'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  BarChart3, 
  Users, 
  Search, 
  Mail, 
  Zap,
  Loader2
} from "lucide-react";
import { n8nClient } from "@/lib/n8n-client";
import { toast } from "sonner";

interface QuickActionResult {
  success: boolean;
  message: string;
  data?: any;
}

export function QuickActions() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = (action: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [action]: loading }));
  };

  const handleQuickAction = async (actionId: string, webhookPath: string) => {
    setLoading(actionId, true);
    try {
      // The key change: ensure POST method is used and an empty object is sent if no specific data is needed
      const response = await n8nClient.triggerWebhook(webhookPath, "POST", {});
      const rawData = await response.json();
      // Ensure we handle the array wrapper if n8n sends it
      const result: QuickActionResult = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      
      if (result.success) {
        toast.success(result.message);
        
        // Handle specific action results for more detailed toasts
        if (actionId === "generate-content" && result.data) {
          toast.info(`Generated ${result.data.platform} content: "${result.data.content.substring(0, 50)}..."`);
        } else if (actionId === "business-analysis" && result.data) {
          toast.info(`Analysis: ${result.data.analysisType} (${result.data.confidenceScore}% confidence)`);
        } else if (actionId === "check-leads" && result.data) {
          toast.info(`Found ${result.data.summary.totalLeads} leads (${result.data.summary.highPriorityLeads} high priority)`);
        }
      } else {
        toast.error(result.message || "Action failed");
      }
    } catch (error) {
      console.error(`Failed to execute ${actionId}:`, error);
      toast.error(`Failed to ${actionId.replace("-", " ")}. Please try again.`);
    } finally {
      setLoading(actionId, false);
    }
  };

  const quickActions = [
    {
      id: "generate-content",
      title: "Generate Content",
      description: "Create AI-powered social media content",
      icon: FileText,
      webhookPath: "generate-content"
    },
    {
      id: "business-analysis",
      title: "Run Analysis",
      description: "Get business insights and recommendations",
      icon: BarChart3,
      webhookPath: "run-business-analysis"
    },
    {
      id: "check-leads",
      title: "Check Leads",
      description: "Scan for new leads and opportunities",
      icon: Users,
      webhookPath: "check-new-leads"
    },
    {
      id: "start-scraper",
      title: "Start Scraper",
      description: "Begin web scraping for market data",
      icon: Search,
      webhookPath: "start-scraper",
      disabled: true // Will be enabled in Web Scraper phase
    },
    {
      id: "send-report",
      title: "Send Daily Report",
      description: "Generate and send daily business report",
      icon: Mail,
      webhookPath: "send-daily-report",
      disabled: true // Will be enabled in Reports phase
    },
    {
      id: "optimize-campaigns",
      title: "Optimize Campaigns",
      description: "AI-powered campaign optimization",
      icon: Zap,
      webhookPath: "optimize-campaigns",
      disabled: true // Will be enabled in Content Hub phase
    }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isLoading = loadingStates[action.id];
            const isDisabled = action.disabled || isLoading;
            
            return (
              <Button
                key={action.id}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent/50 transition-colors ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => !isDisabled && handleQuickAction(action.id, action.webhookPath)}
                disabled={isDisabled}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`p-2 rounded-md ${action.color} text-white`}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    {action.disabled && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-left w-full">
                  {action.description}
                </p>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// This code defines a QuickActions component that provides various quick actions for the user to perform, such as generating content, running business analysis, checking leads, and more. Each action has an associated webhook path that is triggered when the action is clicked. The component also handles loading states and displays appropriate feedback using toast notifications.