"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Send, 
  Calendar, 
  Edit,
  Trash2,
  Eye,
  Share2,
  BarChart3,
  Loader2,
  CheckCircle,
  Clock,
  FileText,
  Zap
} from "lucide-react";
import { n8nClient } from "@/lib/n8n-client";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  platform: string;
  topic: string;
  tone: string;
  content: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

interface ContentLibrary {
  content: ContentItem[];
  summary: {
    totalContent: number;
    publishedContent: number;
    scheduledContent: number;
    draftContent: number;
    totalEngagement: number;
    lastUpdated: string;
  };
}

export default function ContentHubPage() {
  const [contentLibrary, setContentLibrary] = useState<ContentLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scheduling, setScheduling] = useState<string | null>(null);
  
  // Content generation form
  const [platform, setPlatform] = useState("facebook");
  const [topic, setTopic] = useState("agriculture");
  const [tone, setTone] = useState("professional");
  const [contentType, setContentType] = useState("post");
  
  // Generated content preview
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  // Scheduling form
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  useEffect(() => {
    fetchContentLibrary();
  }, []);

  const fetchContentLibrary = async () => {
    setLoading(true);
    try {
      const response = await n8nClient.triggerWebhook("get-content-library", "GET");
      const rawData = await response.json();
      const result = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      
      if (result.success) {
        setContentLibrary(result.data);
      } else {
        toast.error("Failed to load content library");
      }
    } catch (error) {
      console.error("Failed to fetch content library:", error);
      toast.error("Failed to load content library");
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    setGenerating(true);
    try {
      const response = await n8nClient.triggerWebhook("generate-advanced-content", "POST", {
        platform,
        topic,
        tone,
        contentType
      });
      const rawData = await response.json();
      const result = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      
      if (result.success) {
        setGeneratedContent(result.data);
        toast.success("Content generated successfully!");
      } else {
        toast.error("Failed to generate content");
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      toast.error("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const scheduleContent = async (contentId: string) => {
    if (!scheduleDate || !scheduleTime) {
      toast.error("Please select both date and time for scheduling");
      return;
    }

    setScheduling(contentId);
    try {
      const scheduledTime = `${scheduleDate}T${scheduleTime}:00.000Z`;
      const response = await n8nClient.triggerWebhook("schedule-content", "POST", {
        contentId,
        scheduledTime,
        platform: generatedContent?.platform || platform,
        content: generatedContent?.content || ""
      });
      const rawData = await response.json();
      const result = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      
      if (result.success) {
        toast.success("Content scheduled successfully!");
        setGeneratedContent(null);
        setScheduleDate("");
        setScheduleTime("");
        fetchContentLibrary(); // Refresh the library
      } else {
        toast.error(result.message || "Failed to schedule content");
      }
    } catch (error) {
      console.error("Failed to schedule content:", error);
      toast.error("Failed to schedule content");
    } finally {
      setScheduling(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      facebook: "bg-blue-500",
      twitter: "bg-sky-500",
      linkedin: "bg-blue-700",
      instagram: "bg-pink-500"
    };
    return colors[platform as keyof typeof colors] || "bg-gray-500";
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Content Hub</h1>
          <p className="text-base text-muted-foreground">Create, manage, and schedule AI-powered content across all platforms</p>
        </div>
        <Button onClick={fetchContentLibrary} className="w-full md:w-auto">
          <BarChart3 className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {contentLibrary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Content</p>
                  <p className="font-heading text-2xl font-bold">{contentLibrary.summary.totalContent}</p>
                </div>
                <FileText className="size-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="font-heading text-2xl font-bold">{contentLibrary.summary.publishedContent}</p>
                </div>
                <CheckCircle className="size-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="font-heading text-2xl font-bold">{contentLibrary.summary.scheduledContent}</p>
                </div>
                <Clock className="size-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Engagement</p>
                  <p className="font-heading text-2xl font-bold">{contentLibrary.summary.totalEngagement}</p>
                </div>
                <BarChart3 className="size-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create Content</TabsTrigger>
          <TabsTrigger value="library">Content Library</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Create Content Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Generate New Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Select value={topic} onValueChange={setTopic}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="sustainability">Sustainability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={generateContent} 
                  disabled={generating}
                  className="w-full"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Generate Content
                </Button>
              </CardContent>
            </Card>

            {/* Generated Content Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Content Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPlatformColor(generatedContent.platform)}`} />
                      <Badge variant="outline">{generatedContent.platform}</Badge>
                      <Badge variant="secondary">{generatedContent.tone}</Badge>
                    </div>
                    <Textarea 
                      value={generatedContent.content}
                      readOnly
                      className="min-h-[120px]"
                    />
                    <div className="flex flex-wrap gap-1">
                      {generatedContent.hashtags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground font-normal">
                      <p>Estimated engagement: {generatedContent.estimatedEngagement}</p>
                      <p>Word count: {generatedContent.wordCount}</p>
                    </div>
                    
                    {/* Scheduling Section */}
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-heading text-lg font-semibold">Schedule for Publishing</h4>
                      <div className="grid grid-cols-2 gap-2 md:gap-4">
                        <div>
                          <Label htmlFor="scheduleDate">Date</Label>
                          <Input 
                            id="scheduleDate"
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="scheduleTime">Time</Label>
                          <Input 
                            id="scheduleTime"
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={() => scheduleContent(generatedContent.id)}
                        disabled={scheduling === generatedContent.id}
                        className="w-full"
                      >
                        {scheduling === generatedContent.id ? (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                          <Calendar className="size-4 mr-2" />
                        )}
                        Schedule Content
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Generate content to see preview
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Library Tab */}
        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>Content Library</CardTitle>
            </CardHeader>
            <CardContent>
              {contentLibrary && contentLibrary.content.length > 0 ? (
                <ScrollArea className="h-[500px] md:h-[600px]">
                  <div className="space-y-4">
                    {contentLibrary.content.map((item) => (
                      <div key={item.id} className="p-4 border rounded-xl bg-background/50 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusIcon(item.status)}
                            <div className={`w-3 h-3 rounded-full ${getPlatformColor(item.platform)}`} />
                            <Badge variant="outline">{item.platform}</Badge>
                            <Badge variant={item.status === 'published' ? 'default' : item.status === 'scheduled' ? 'secondary' : 'outline'}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="rounded-full">
                              <Eye className="size-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-full">
                              <Edit className="size-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-full">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm mb-3 line-clamp-3 font-normal">{item.content}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.hashtags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs font-medium">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs md:text-sm text-muted-foreground">
                          <span>Created: {formatDate(item.createdAt)}</span>
                          {item.engagement && (
                            <span>
                              {item.engagement.likes + item.engagement.shares + item.engagement.comments} total engagements
                            </span>
                          )}
                          {item.scheduledFor && (
                            <span>Scheduled: {formatDate(item.scheduledFor)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No content found. Create your first piece of content!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Analytics dashboard coming soon! This will show detailed performance metrics for your content.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}