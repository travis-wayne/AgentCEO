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
  Search, 
  Filter,
  Edit,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Star,
  MoreVertical
} from "lucide-react";
import { n8nClient } from "@/lib/n8n-client";
import { toast } from "sonner";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  jobTitle?: string;
  industry: string;
  source: string;
  score: number;
  status: string;
  priority: string;
  estimatedValue: number;
  farmSize?: number;
  currentChallenges: string[];
  interests: string[];
  createdAt: string;
  lastActivity: string;
  nextFollowUp?: string;
  notes: string;
  tags: string[];
  interactions: number;
  lastInteractionType: string;
}

interface LeadSummary {
  totalLeads: number;
  highPriorityLeads: number;
  mediumPriorityLeads: number;
  lowPriorityLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  closedWonLeads: number;
  totalEstimatedValue: number;
  averageScore: number;
  leadsBySource: Record<string, number>;
  leadsByIndustry: Record<string, number>;
  lastUpdated: string;
}

interface LeadData {
  leads: Lead[];
  summary: LeadSummary;
}

export default function LeadsPage() {
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingLead, setAddingLead] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // New lead form
  const [newLead, setNewLead] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    industry: "Agriculture",
    source: "Manual Entry",
    estimatedValue: "",
    farmSize: "",
    notes: ""
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await n8nClient.triggerWebhook("get-all-leads", "GET");
      const rawData = await response.json();
      const result = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      
      if (result.success) {
        setLeadData(result.data);
      } else {
        toast.error("Failed to load leads");
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const addNewLead = async () => {
    if (!newLead.firstName || !newLead.lastName || !newLead.email || !newLead.company) {
      toast.error("Please fill in all required fields");
      return;
    }

    setAddingLead(true);
    try {
      const leadData = {
        ...newLead,
        estimatedValue: newLead.estimatedValue ? parseInt(newLead.estimatedValue) : undefined,
        farmSize: newLead.farmSize ? parseInt(newLead.farmSize) : undefined
      };

      const response = await n8nClient.triggerWebhook("add-new-lead", "POST", leadData);
      const rawData = await response.json();
      const result = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      
      if (result.success) {
        toast.success(result.message);
        setShowAddDialog(false);
        setNewLead({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          jobTitle: "",
          industry: "Agriculture",
          source: "Manual Entry",
          estimatedValue: "",
          farmSize: "",
          notes: ""
        });
        fetchLeads(); // Refresh the leads list
      } else {
        toast.error(result.message || "Failed to add lead");
      }
    } catch (error) {
      console.error("Failed to add lead:", error);
      toast.error("Failed to add lead");
    } finally {
      setAddingLead(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    setUpdatingStatus(leadId);
    try {
      const response = await n8nClient.triggerWebhook("update-lead-status", "POST", {
        leadId,
        status: newStatus,
        notes: `Status updated to ${newStatus} via Agent CEO interface`
      });
      const rawData = await response.json();
      const result = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      
      if (result.success) {
        toast.success(result.message);
        fetchLeads(); // Refresh the leads list
      } else {
        toast.error(result.message || "Failed to update lead status");
      }
    } catch (error) {
      console.error("Failed to update lead status:", error);
      toast.error("Failed to update lead status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "New": "bg-blue-500",
      "Contacted": "bg-yellow-500",
      "Qualified": "bg-green-500",
      "Proposal Sent": "bg-purple-500",
      "Negotiation": "bg-orange-500",
      "Closed Won": "bg-emerald-500",
      "Closed Lost": "bg-red-500",
      "On Hold": "bg-gray-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      "High": "text-red-500",
      "Medium": "text-yellow-500",
      "Low": "text-green-500"
    };
    return colors[priority as keyof typeof colors] || "text-gray-500";
  };

  const filteredLeads = leadData?.leads.filter(lead => {
    const matchesSearch = searchTerm === "" || 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
          <h1 className="font-heading font-semibold text-2xl md:text-3xl text-foreground tracking-tight">Lead Management</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">Track and manage your business leads and opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLeads}>
            <Target className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newLead.firstName}
                      onChange={(e) => setNewLead({...newLead, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newLead.lastName}
                      onChange={(e) => setNewLead({...newLead, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={newLead.company}
                    onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={newLead.jobTitle}
                      onChange={(e) => setNewLead({...newLead, jobTitle: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={newLead.industry} onValueChange={(value) => setNewLead({...newLead, industry: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Food Processing">Food Processing</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Select value={newLead.source} onValueChange={(value) => setNewLead({...newLead, source: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manual Entry">Manual Entry</SelectItem>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Trade Show">Trade Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newLead.notes}
                    onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={addNewLead} 
                  disabled={addingLead}
                  className="w-full"
                >
                  {addingLead ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {leadData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{leadData.summary.totalLeads}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold">{leadData.summary.highPriorityLeads}</p>
                </div>
                <Star className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Qualified</p>
                  <p className="text-2xl font-bold">{leadData.summary.qualifiedLeads}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pipeline Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(leadData.summary.totalEstimatedValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-base md:text-lg font-normal"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] md:w-[150px] text-base font-normal">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                  <SelectItem value="Closed Won">Closed Won</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px] md:w-[150px] text-base font-normal">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading font-semibold text-xl md:text-2xl text-foreground tracking-tight">Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 border rounded-xl bg-background hover:bg-accent/60 transition-colors shadow-sm flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2 mb-2">
                      <div className="flex items-center gap-1 md:gap-2">
                        <h3 className="font-heading font-semibold text-base md:text-lg lg:text-xl text-foreground truncate">
                          {lead.firstName} {lead.lastName}
                        </h3>
                        <Badge variant="outline" className="font-medium text-xs md:text-sm lg:text-base px-2 py-0.5 rounded-md">
                          {lead.company}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(lead.status)}`} />
                        <Badge variant="secondary" className="font-semibold text-xs md:text-sm lg:text-base px-2 py-0.5 rounded-md">
                          {lead.status}
                        </Badge>
                      </div>
                      <span className={`text-xs md:text-sm lg:text-base font-semibold ${getPriorityColor(lead.priority)}`}> 
                        {lead.priority} Priority
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 md:gap-2 lg:gap-3 truncate min-w-0">
                        <Mail className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 shrink-0" />
                        <span className="truncate text-xs md:text-sm lg:text-base">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1 md:gap-2 lg:gap-3 truncate min-w-0">
                          <Phone className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 shrink-0" />
                          <span className="truncate text-xs md:text-sm lg:text-base">{lead.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 md:gap-2 lg:gap-3 min-w-0">
                        <DollarSign className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 shrink-0" />
                        <span className="text-xs md:text-sm lg:text-base">{formatCurrency(lead.estimatedValue)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {lead.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-medium px-2 py-0.5 rounded"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="text-xs md:text-sm lg:text-base">Score: <span className="font-semibold text-foreground">{lead.score}</span>/100</span>
                      <span className="text-xs md:text-sm lg:text-base">Source: <span className="font-medium text-foreground">{lead.source}</span></span>
                      <span className="text-xs md:text-sm lg:text-base">Created: {formatDate(lead.createdAt)}</span>
                      {lead.nextFollowUp && (
                        <span className="flex items-center gap-1 mt-1 text-xs md:text-sm lg:text-base">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                          <span>Follow-up: <span className="font-medium text-foreground">{formatDate(lead.nextFollowUp)}</span></span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center gap-2 md:gap-3 min-w-[140px] md:min-w-[160px]">
                    <Select
                      value={lead.status}
                      onValueChange={(value) => updateLeadStatus(lead.id, value)}
                      disabled={updatingStatus === lead.id}
                    >
                      <SelectTrigger className="w-[110px] sm:w-[120px] md:w-[140px] text-xs md:text-sm lg:text-base font-medium border-muted-foreground/30 min-h-[36px] sm:min-h-[40px] lg:min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Closed Won">Closed Won</SelectItem>
                        <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    {updatingStatus === lead.id && (
                      <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 lg:h-6 lg:w-6 animate-spin text-muted-foreground" />
                    )}
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-accent min-h-[36px] sm:min-h-[40px] lg:min-h-[44px] w-9 sm:w-10 lg:w-12">
                      <MoreVertical className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}