"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, Zap } from "lucide-react";
import { BusinessMetrics } from "@/types";
import { n8nClient } from "@/lib/n8n-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function DashboardKPICards() {
    const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMetrics() {
            setLoading(true);
            setError(null);
            try {
                const response = await n8nClient.triggerWebhook("get-business-metrics", "GET");
                const rawData = await response.json();

                // --- START OF CHANGE ---
                // Check if rawData is an array and extract the first element
                const data = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
                // --- END OF CHANGE ---

                // Basic validation of the received data structure
                if (!data || typeof data !== 'object' || !data.revenue || !data.leads || !data.conversions) {
                    throw new Error("Invalid data structure received from n8n.");
                }

                setMetrics(data as BusinessMetrics);
            } catch (err) {
                console.error("Failed to fetch business metrics:", err);
                setError("Failed to load business metrics. Please check n8n connection and ensure the workflow is active and returning valid data.");
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                            <div className="rounded-full bg-gray-700 animate-pulse size-4"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold rounded bg-gray-700 animate-pulse w-3/4 h-8"></div>
                            <p className="text-xs text-muted-foreground bg-gray-800 size-4 w-1/2 rounded mt-2 animate-pulse"></p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="col-span-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        );
    }

    if (!metrics) {
        return (
            <Alert variant="warning" className="col-span-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                    No metrics data available. Configure your n8n workflow to provide business insights.
                </AlertDescription>
            </Alert>
        );
    }

    const renderChange = (change: number) => {
        const isPositive = change >= 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const colorClass = isPositive ? "text-emerald-500" : "text-red-500";

        return (
            <div className={`flex items-center text-xs ${colorClass}`}>
                <Icon className="size-4 mr-1" />
                {Math.abs(change).toFixed(2)}%
            </div>
        );
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {metrics.revenue?.current !== undefined && metrics.revenue?.current !== null
                            ? `$${metrics.revenue.current.toLocaleString()}`
                            : '—'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.revenue?.change !== undefined && metrics.revenue?.change !== null
                            ? renderChange(metrics.revenue.change)
                            : '—'}{
                        ' '}
                        from last month
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Leads Generated</CardTitle>
                    <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {metrics.leads?.current !== undefined && metrics.leads?.current !== null
                            ? `+${metrics.leads.current}`
                            : '—'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.leads?.change !== undefined && metrics.leads?.change !== null
                            ? renderChange(metrics.leads.change)
                            : '—'}{
                        ' '}
                        from last month
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                    <TrendingUp className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {metrics.conversions?.current !== undefined && metrics.conversions?.current !== null
                            ? metrics.conversions.current
                            : '—'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.conversions?.change !== undefined && metrics.conversions?.change !== null
                            ? renderChange(metrics.conversions.change)
                            : '—'}{
                        ' '}
                        from last month
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                    <Zap className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {metrics.activeWorkflows !== undefined && metrics.activeWorkflows !== null
                            ? metrics.activeWorkflows
                            : '—'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        AI-powered automations running
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
