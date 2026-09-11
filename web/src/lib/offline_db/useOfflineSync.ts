"use client";

import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { getOfflineQueue, clearOfflineQueue } from "./offline_db";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const refreshQueueCount = useCallback(() => {
    const queue = getOfflineQueue();
    setPendingCount(queue.filter((i) => i.status === "PENDING").length);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      refreshQueueCount();

      const handleOnline = () => {
        setIsOnline(true);
        message.success("Network connection restored. Syncing offline records...");
        const queue = getOfflineQueue();
        if (queue.length > 0) {
          setTimeout(() => {
            clearOfflineQueue();
            setPendingCount(0);
            message.success(`Successfully synchronized ${queue.length} offline records.`);
          }, 1500);
        }
      };

      const handleOffline = () => {
        setIsOnline(false);
        message.warning("Network connection lost. Operations will be queued locally.");
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [refreshQueueCount]);

  return {
    isOnline,
    pendingCount,
    refreshQueueCount,
  };
}
