import { User } from "@prisma/client";
import type { Icon } from "lucide-react";

import { Icons } from "@/components/shared/icons";
import { UserRole } from "@prisma/client"; // Import UserRole

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  mailSupport: string;
  links: {
    twitter: string;
    github: string;
  };
};

export type NavItem = {
  title: string;
  href: string;
  badge?: number;
  disabled?: boolean;
  external?: boolean;
  authorizeOnly?: UserRole; // Added this line
  icon?: keyof typeof Icons;
};

export type MainNavItem = NavItem;

export type MarketingConfig = {
  mainNav: MainNavItem[];
};

export type SidebarNavItem = {
  title: string;
  items: NavItem[];
  authorizeOnly?: UserRole;
  icon?: keyof typeof Icons;
};

export type DocsConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};

// Dashboard Configuration
export type DashboardConfig = {
  mainNav: MainNavItem[];
  sidebarNav: NavItem[];
};

// Agent CEO Specific Types
export type WorkflowStatus = "active" | "inactive" | "running" | "error";

export type Workflow = {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  lastRun?: Date;
  nextRun?: Date;
  executions: number;
  successRate: number;
};

export type ContentItem = {
  id: string;
  platform: string;
  type: "post" | "story" | "article" | "video";
  title: string;
  content: string;
  status: "draft" | "review" | "approved" | "scheduled" | "published";
  scheduledFor?: Date;
  createdAt: Date;
  imageUrl?: string;
  metrics?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  score: number;
  lastContact?: Date;
  notes?: string;
  value?: number;
};

export type ScraperTask = {
  id: string;
  name: string;
  url: string;
  selectors: string[];
  schedule: string;
  status: "active" | "inactive" | "running" | "error";
  lastRun?: Date;
  nextRun?: Date;
  dataCount: number;
  outputFormat: "json" | "csv" | "excel";
};

export type BusinessMetrics = {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  leads: {
    current: number;
    previous: number;
    change: number;
  };
  conversions: {
    current: number;
    previous: number;
    change: number;
  };
  activeWorkflows: number;
  aiInsights: string[];
};

// subscriptions
export type SubscriptionPlan = {
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string | null;
    yearly: string | null;
  };
};

export type UserSubscriptionPlan = SubscriptionPlan &
  Pick<User, "stripeCustomerId" | "stripeSubscriptionId" | "stripePriceId"> & {
    stripeCurrentPeriodEnd: number;
    isPaid: boolean;
    interval: "month" | "year" | null;
    isCanceled?: boolean;
  };

// compare plans
export type ColumnType = string | boolean | null;
export type PlansRow = { feature: string; tooltip?: string } & {
  [key in (typeof plansColumns)[number]]: ColumnType;
};

// landing sections
export type InfoList = {
  icon: keyof typeof Icons;
  title: string;
  description: string;
};

export type InfoLdg = {
  title: string;
  image: string;
  description: string;
  list: InfoList[];
};

export type FeatureLdg = {
  title: string;
  description: string;
  link: string;
  icon: keyof typeof Icons;
};

export type TestimonialType = {
  name: string;
  job: string;
  image: string;
  review: string;
};
