'use client'

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Performance() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Reviews</h1>
          <p className="text-muted-foreground">Track and manage performance evaluations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Management</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Performance review features coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
