import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard/header";
import { CardSkeleton } from "@/components/shared/card-skeleton";

export default function DashboardBillingLoading() {
  return (
    <>
      <DashboardHeader
        heading="Leads"
        text="Manage your leads."
      />
      <div className="grid gap-8">
        <Skeleton className="h-28 w-full rounded-lg md:h-24" />
        <CardSkeleton />
      </div>
    </>
  );
}
