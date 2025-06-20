"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  RefreshCw, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { n8nClient } from "@/lib/n8n-client";
import { toast } from "sonner";

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  nodes: any[];
  connections: any;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  data?: any;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingWorkflows, setExecutingWorkflows] = useState<Set<string>>(new Set());
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWorkflow) {
      fetchExecutions(selectedWorkflow);
    }
  }, [selectedWorkflow]);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      // For now, we'll simulate workflow data since n8n API might require authentication
      // In a real implementation, you'd call: const data = await n8nClient.getWorkflows();
      
      const simulatedWorkflows: Workflow[] = [
        {
          id: "1",
          name: "Agent CEO - Generate Content",
          active: true,
          tags: ["content", "social-media"],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-20T14:30:00Z",
          nodes: [],
          connections: {}
        },
        {
          id: "2", 
          name: "Agent CEO - Business Analysis",
          active: true,
          tags: ["analysis", "business"],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-20T14:30:00Z",
          nodes: [],
          connections: {}
        },
        {
          id: "3",
          name: "Agent CEO - Check New Leads",
          active: true,
          tags: ["leads", "crm"],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-20T14:30:00Z",
          nodes: [],
          connections: {}
        },
        {
          id: "4",
          name: "Daily Business Report",
          active: false,
          tags: ["reports", "daily"],
          createdAt: "2024-01-10T09:00:00Z",
          updatedAt: "2024-01-18T16:45:00Z",
          nodes: [],
          connections: {}
        },
        {
          id: "5",
          name: "Social Media Scheduler",
          active: true,
          tags: ["social-media", "scheduler"],
          createdAt: "2024-01-12T11:30:00Z",
          updatedAt: "2024-01-19T13:20:00Z",
          nodes: [],
          connections: {}
        }
      ];

      setWorkflows(simulatedWorkflows);
      if (simulatedWorkflows.length > 0) {
        setSelectedWorkflow(simulatedWorkflows[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
      toast.error("Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutions = async (workflowId: string) => {
    try {
      // Simulate execution history
      const simulatedExecutions: WorkflowExecution[] = [
        {
          id: "exec-1",
          workflowId: workflowId,
          mode: "webhook",
          startedAt: "2024-01-20T15:30:00Z",
          stoppedAt: "2024-01-20T15:30:05Z",
          status: "success"
        },
        {
          id: "exec-2", 
          workflowId: workflowId,
          mode: "manual",
          startedAt: "2024-01-20T14:15:00Z",
          stoppedAt: "2024-01-20T14:15:03Z",
          status: "success"
        },
        {
          id: "exec-3",
          workflowId: workflowId,
          mode: "webhook",
          startedAt: "2024-01-20T13:45:00Z",
          stoppedAt: "2024-01-20T13:45:02Z",
          status: "error"
        }
      ];

      setExecutions(simulatedExecutions);
    } catch (error) {
      console.error("Failed to fetch executions:", error);
    }
  };

  const executeWorkflow = async (workflowId: string, workflowName: string) => {
    setExecutingWorkflows(prev => new Set(prev).add(workflowId));
    
    try {
      // Map workflow names to webhook paths
      const webhookMap: Record<string, string> = {
        "Agent CEO - Generate Content": "generate-content",
        "Agent CEO - Business Analysis": "run-business-analysis", 
        "Agent CEO - Check New Leads": "check-new-leads"
      };

      const webhookPath = webhookMap[workflowName];
      
      if (webhookPath) {
        const response = await n8nClient.triggerWebhook(webhookPath, "POST", {});
        const rawData = await response.json();
        const result = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
        
        if (result.success) {
          toast.success(`Workflow "${workflowName}" executed successfully!`);
          // Refresh executions
          fetchExecutions(workflowId);
        } else {
          toast.error(`Workflow execution failed: ${result.message}`);
        }
      } else {
        toast.info(`Workflow "${workflowName}" execution simulated (no webhook configured)`);
      }
    } catch (error) {
      console.error("Failed to execute workflow:", error);
      toast.error("Failed to execute workflow");
    } finally {
      setExecutingWorkflows(prev => {
        const newSet = new Set(prev);
        newSet.delete(workflowId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-2 sm:px-4">
        <Loader2 className="size-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground text-base mt-1">Manage and monitor your n8n automation workflows</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={fetchWorkflows} className="flex-1 md:flex-none">
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button className="flex-1 md:flex-none">
            <Plus className="size-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Workflows List */}
        <div className="w-full lg:w-2/3 order-2 lg:order-1">
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">All Workflows <span className="font-normal text-muted-foreground">({workflows.length})</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className={`p-4 rounded-xl border transition-colors cursor-pointer flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                      selectedWorkflow === workflow.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedWorkflow(workflow.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-medium truncate max-w-[180px] sm:max-w-[220px] md:max-w-xs lg:max-w-md text-base md:text-lg">{workflow.name}</h3>
                        <Badge variant={workflow.active ? "default" : "secondary"}>
                          {workflow.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {workflow.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs md:text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        Updated {formatDate(workflow.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          executeWorkflow(workflow.id, workflow.name);
                        }}
                        disabled={executingWorkflows.has(workflow.id)}
                        className="px-2"
                      >
                        {executingWorkflows.has(workflow.id) ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Play className="size-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" className="px-2">
                        <Settings className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Execution History */}
        <div className="w-full lg:w-1/3 order-1 lg:order-2">
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedWorkflow ? (
                <ScrollArea className="h-[320px] md:h-[400px]">
                  <div className="space-y-3">
                    {executions.map((execution) => (
                      <div
                        key={execution.id}
                        className="p-3 rounded-xl border flex flex-col gap-2 bg-background/50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(execution.status)}
                            <span className="text-sm md:text-base font-medium capitalize">
                              {execution.status}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs md:text-sm">
                            {execution.mode}
                          </Badge>
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          <div>Started: {formatDate(execution.startedAt)}</div>
                          {execution.stoppedAt && (
                            <div>Finished: {formatDate(execution.stoppedAt)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-muted-foreground py-8 text-sm md:text-base">
                  Select a workflow to view execution history
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}