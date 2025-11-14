"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notificationAPI } from "@/lib/api";
import { Notification } from "@/types";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationAPI.getAll();
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
      toast.error("Gagal mengambil notifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await notificationAPI.markAsRead(notification.id);
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }

      setIsOpen(false);

      router.push(notification.link);
    } catch (error) {
      console.error("Gagal memproses notifikasi:", error);
      toast.error("Gagal memproses notifikasi");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notifikasi
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <DropdownMenuItem disabled>Memuat notifikasi...</DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            Tidak ada notifikasi baru
          </DropdownMenuItem>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className="flex items-start gap-2 cursor-pointer"
            >
              <div className="flex-1 space-y-1">
                <p
                  className={`text-sm ${
                    !notif.is_read ? "font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {notif.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notif.created_at), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
              </div>
              {!notif.is_read && (
                <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
