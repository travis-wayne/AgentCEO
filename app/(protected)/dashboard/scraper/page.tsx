"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Play, 
  Pause,
  Search, 
  Settings,
  Globe,
  Clock,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from "lucide-react";
import { n8nClient } from "@/lib/n8n-client";
import { toast } from "sonner";

interface DataPoint {
  name: string;
  selector: string;
  type: 'text' | 'number' | 'date' | 'url';
  required: boolean;
}

interface ScrapingTask {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  dataPoints: DataPoint[];
  schedule: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
    interval: number | null;
    nextRun: string | null;
  };
  settings: {
    timeout: number;
    retries: number;
    delay: number;
    userAgent: string;
    respectRobots: boolean;
  };
  status: 'active' | 'paused' | 'error';
  createdAt: string;
  lastRun: string | null;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastError: string | null;
  tags: string[];
}

interface ScrapingSummary {
  totalTasks: number;
  activeTasks: number;
  pausedTasks: number;
  totalRuns: number;
  totalSuccessful: number;
  totalFailed: number;
  successRate: number;
  upcomingTasks: number;
  tasksByCategory: Record<string, number>;
  tasksByFrequency: Record<string, number>;
  lastUpdated: string;
}

interface ScrapingData {
  tasks: ScrapingTask[];
  summary: ScrapingSummary;
}

export default function ScraperPage() {
  const [scrapingData, setScrapingData] = useState<ScrapingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<ScrapingTask | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [scrapingResults, setScrapingResults] = useState<any>(null);

  // New task form
  const [newTask, setNewTask] = useState({
    name: "",
    url: "",
    description: "",
    category: "General",
    frequency: "manual",
    interval: "24",
    timeout: "30",
    retries: "3",
    delay: "1"
  });

  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { name: "", selector: "", type: "text", required: true }
  ]);

  useEffect(() => {
    fetchScrapingTasks();
  }, []);

  const fetchScrapingTasks = async () => {
    setLoading(true);
    try {
      const response = await n8nClient.triggerWebhook("get-scraping-tasks", "GET");
      const rawData = await response.json();
      const result = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      
      if (result.success) {
        setScrapingData(result.data);
      } else {
        toast.error("Failed to load scraping tasks");
      }
    } catch (error) {
      console.error("Failed to fetch scraping tasks:", error);
      toast.error("Failed to load scraping tasks");
    } finally {
      setLoading(false);
    }
  };

  const createScrapingTask = async () => {
    if (!newTask.name || !newTask.url || dataPoints.some(dp => !dp.name || !dp.selector)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreatingTask(true);
    try {
      const taskData = {
        ...newTask,
        dataPoints: dataPoints.filter(dp => dp.name && dp.selector),
        interval: newTask.frequency === 'manual' ? null : parseInt(newTask.interval),
        timeout: parseInt(newTask.timeout),
        retries: parseInt(newTask.retries),
        delay: parseInt(newTask.delay)
      };

      const response = await n8nClient.triggerWebhook("create-scraping-task", "POST", taskData);
      const rawData = await response.json();
      const result = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      
      if (result.success) {
        toast.success(result.message);
        setShowCreateDialog(false);
        resetForm();
        fetchScrapingTasks();
      } else {
        toast.error(result.message || "Failed to create scraping task");
      }
    } catch (error) {
      console.error("Failed to create scraping task:", error);
      toast.error("Failed to create scraping task");
    } finally {
      setCreatingTask(false);
    }
  };

  const runScrapingTask = async (taskId: string) => {
    setRunningTasks(prev => new Set(prev).add(taskId));
    try {
      const response = await n8nClient.triggerWebhook("run-scraping-task", "POST", { taskId });
      const rawData = await response.json();
      const result = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      
      if (result.success) {
        toast.success(result.message);
        setScrapingResults(result.data);
        setShowResultsDialog(true);
        fetchScrapingTasks(); // Refresh tasks
      } else {
        toast.error(result.message || "Failed to run scraping task");
      }
    } catch (error) {
      console.error("Failed to run scraping task:", error);
      toast.error("Failed to run scraping task");
    } finally {
      setRunningTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const resetForm = () => {
    setNewTask({
      name: "",
      url: "",
      description: "",
      category: "General",
      frequency: "manual",
      interval: "24",
      timeout: "30",
      retries: "3",
      delay: "1"
    });
    setDataPoints([{ name: "", selector: "", type: "text", required: true }]);
  };

  const addDataPoint = () => {
    setDataPoints([...dataPoints, { name: "", selector: "", type: "text", required: false }]);
  };

  const removeDataPoint = (index: number) => {
    if (dataPoints.length > 1) {
      setDataPoints(dataPoints.filter((_, i) => i !== index));
    }
  };

  const updateDataPoint = (index: number, field: keyof DataPoint, value: any) => {
    const updated = [...dataPoints];
    updated[index] = { ...updated[index], [field]: value };
    setDataPoints(updated);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "active": "bg-green-500",
      "paused": "bg-yellow-500",
      "error": "bg-red-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
        <div>
          <h1 className="font-heading font-semibold text-2xl md:text-3xl text-foreground tracking-tight">Web Scraper</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">Configure and manage automated web scraping tasks for market research</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchScrapingTasks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Scraping Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taskName">Task Name *</Label>
                    <Input
                      id="taskName"
                      value={newTask.name}
                      onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                      placeholder="e.g., Competitor Pricing Monitor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTask.category} onValueChange={(value) => setNewTask({...newTask, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Pricing">Pricing</SelectItem>
                        <SelectItem value="News">News</SelectItem>
                        <SelectItem value="Market Data">Market Data</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Competitor">Competitor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="url">Target URL *</Label>
                  <Input
                    id="url"
                    value={newTask.url}
                    onChange={(e) => setNewTask({...newTask, url: e.target.value})}
                    placeholder="https://example.com/page-to-scrape"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Describe what this scraping task will do..."
                    rows={2}
                  />
                </div>

                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Data Points to Extract *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addDataPoint}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {dataPoints.map((dp, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-3">
                          <Label className="text-xs">Field Name</Label>
                          <Input
                            value={dp.name}
                            onChange={(e) => updateDataPoint(index, 'name', e.target.value)}
                            placeholder="e.g., Price"
                            size="sm"
                          />
                        </div>
                        <div className="col-span-4">
                          <Label className="text-xs">CSS Selector</Label>
                          <Input
                            value={dp.selector}
                            onChange={(e) => updateDataPoint(index, 'selector', e.target.value)}
                            placeholder="e.g., .price, #cost"
                            size="sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Type</Label>
                          <Select value={dp.type} onValueChange={(value) => updateDataPoint(index, 'type', value)}>
                            <SelectTrigger size="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="url">URL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <label className="flex items-center space-x-1 text-xs">
                            <input
                              type="checkbox"
                              checked={dp.required}
                              onChange={(e) => updateDataPoint(index, 'required', e.target.checked)}
                            />
                            <span>Required</span>
                          </label>
                        </div>
                        <div className="col-span-1">
                          {dataPoints.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDataPoint(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Schedule</Label>
                    <Select value={newTask.frequency} onValueChange={(value) => setNewTask({...newTask, frequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="hourly">Every Few Hours</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newTask.frequency !== 'manual' && (
                    <div>
                      <Label htmlFor="interval">Interval (hours)</Label>
                      <Input
                        id="interval"
                        type="number"
                        value={newTask.interval}
                        onChange={(e) => setNewTask({...newTask, interval: e.target.value})}
                        min="1"
                        max="168"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="timeout">Timeout (sec)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={newTask.timeout}
                      onChange={(e) => setNewTask({...newTask, timeout: e.target.value})}
                      min="10"
                      max="300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="retries">Retries</Label>
                    <Input
                      id="retries"
                      type="number"
                      value={newTask.retries}
                      onChange={(e) => setNewTask({...newTask, retries: e.target.value})}
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delay">Delay (sec)</Label>
                    <Input
                      id="delay"
                      type="number"
                      value={newTask.delay}
                      onChange={(e) => setNewTask({...newTask, delay: e.target.value})}
                      min="0"
                      max="60"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={createScrapingTask} 
                  disabled={creatingTask}
                  className="w-full"
                >
                  {creatingTask ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Scraping Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {scrapingData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{scrapingData.summary.totalTasks}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">{scrapingData.summary.activeTasks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{scrapingData.summary.successRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Runs</p>
                  <p className="text-2xl font-bold">{scrapingData.summary.totalRuns}</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading font-semibold text-xl md:text-2xl text-foreground tracking-tight">Scraping Tasks ({scrapingData?.tasks.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {scrapingData && scrapingData.tasks.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {scrapingData.tasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-xl bg-background hover:bg-accent/60 transition-colors shadow-sm flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2 mb-2">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                          <div className="flex items-center gap-1 md:gap-2">
                            {getStatusIcon(task.status)}
                            <h3 className="font-heading font-semibold text-base md:text-lg lg:text-xl text-foreground truncate">{task.name}</h3>
                            <Badge variant="outline" className="font-medium text-xs md:text-sm lg:text-base px-2 py-0.5 rounded-md">{task.category}</Badge>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2 mt-1 xs:mt-0">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                            <Badge variant="secondary" className="font-semibold text-xs md:text-sm lg:text-base px-2 py-0.5 rounded-md">{task.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm lg:text-base text-muted-foreground mb-2 break-words">{task.description}</p>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1 min-w-0 break-all">
                          <Globe className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                          <span className="truncate">{task.url}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                          {task.dataPoints.length} fields
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                          {task.schedule.frequency}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-medium px-2 py-0.5 rounded">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 md:gap-4 items-center text-xs md:text-sm text-muted-foreground">
                        <span>Runs: {task.totalRuns}</span>
                        <span>Success: {task.successfulRuns}</span>
                        <span>Failed: {task.failedRuns}</span>
                        {task.lastRun && <span>Last: {formatDate(task.lastRun)}</span>}
                        {task.schedule.nextRun && (
                          <span>Next: {formatDate(task.schedule.nextRun)}</span>
                        )}
                      </div>
                      {task.lastError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                          Error: {task.lastError}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row flex-wrap items-center gap-2 mt-2 md:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runScrapingTask(task.id)}
                        disabled={runningTasks.has(task.id)}
                      >
                        {runningTasks.has(task.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No scraping tasks found. Create your first scraping task to get started!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scraping Results</DialogTitle>
          </DialogHeader>
          {scrapingResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{scrapingResults.recordsExtracted}</p>
                  <p className="text-xs text-muted-foreground">Records Extracted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{scrapingResults.executionTime}s</p>
                  <p className="text-xs text-muted-foreground">Execution Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">{scrapingResults.dataQuality}%</p>
                  <p className="text-xs text-muted-foreground">Data Quality</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{scrapingResults.metrics?.totalFields}</p>
                  <p className="text-xs text-muted-foreground">Total Fields</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Extracted Data</h4>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {scrapingResults.scrapedData?.map((record: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {Object.entries(record).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium text-muted-foreground">{key}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Save to Database
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}