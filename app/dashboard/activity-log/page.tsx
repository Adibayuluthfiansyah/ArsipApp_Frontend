"use client";

import React, { useEffect, useState } from "react";
import { activityLogAPI, getErrorMessage } from "@/lib/api";
import { ActivityLog } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { ActivityLogTable } from "@/components/activity/ActivityLogTable";
import { ActivityLogMobileList } from "@/components/activity/ActivityLogMobileList";
import { Spinner } from "@/components/ui/spinner";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      try {
        const data = await activityLogAPI.getAll();
        setLogs(data);
      } catch (error) {
        toast.error("Gagal memuat log aktivitas", {
          description: getErrorMessage(error),
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Log Aktivitas</h1>
        <p className="text-muted-foreground">
          Memantau semua tindakan yang terjadi dalam sistem
        </p>
      </div>
      <Card>
        <CardHeader className="border-b mb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Riwayat Aktivitas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <>
              {/* Tampilan Desktop: Tabel */}
              <div className="hidden md:block">
                <ActivityLogTable logs={logs} />
              </div>

              {/* Tampilan Mobile: Card List */}
              <div className="block md:hidden px-4 pb-4">
                <ActivityLogMobileList logs={logs} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
