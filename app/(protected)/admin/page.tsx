import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { DashboardKPICards } from "@/components/dashboard/n8n/kpi-cards";
import { Overview } from "@/components/dashboard/n8n/overview";
import { QuickActions } from "@/components/dashboard/n8n/quick-actions";
import { RecentActivity } from "@/components/dashboard/n8n/recent-activity";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import TransactionsList from "@/components/dashboard/transactions-list";

export const metadata = constructMetadata({
  title: "Dashboard - Agent CEO",
  description: "Overview of your business performance and Agent CEO activities.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <>
      <DashboardHeader
        heading="Content Hub"
        text={`Welcome ${user?.name} — Signed in with: ${user?.email}`}
      />
      <EmptyPlaceholder className="col-span-7">
        <EmptyPlaceholder.Icon name="dashboard" />
        <EmptyPlaceholder.Title>Welcome to the Content Hub</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          This is your central hub for managing and creating content. Use the quick actions to get started.
        </EmptyPlaceholder.Description>
        <Button>
          Get Started
        </Button>
      </EmptyPlaceholder>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Actions Spot</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <QuickActions />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="col-span-3 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Overview />
          </CardContent>
        </Card>
        <RecentActivity />
      </div>
      <DashboardKPICards />
      <div className="col-span-7">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsList />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
// This code defines a DashboardPage component that serves as the main dashboard for the Agent CEO application. It includes a header, quick actions, an overview section, recent activity, and KPI cards. The page is designed to provide users with a comprehensive view of their business performance and activities related to content creation and management.