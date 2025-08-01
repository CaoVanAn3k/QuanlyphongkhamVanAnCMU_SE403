import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { NotificationSettings } from "@shared/schema";

interface NotificationSettingsProps {
  patientId: number;
}

export default function NotificationSettings({ patientId }: NotificationSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<NotificationSettings>({
    queryKey: [`/api/notification-settings/${patientId}`],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationSettings>) => {
      const response = await apiRequest("PATCH", `/api/notification-settings/${patientId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cài đặt đã được cập nhật",
        description: "Tùy chọn thông báo của bạn đã được lưu.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/notification-settings/${patientId}`] });
    },
    onError: () => {
      toast({
        title: "Lỗi cập nhật cài đặt",
        description: "Không cập nhật được cài đặt thông báo. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (setting: keyof Pick<NotificationSettings, "emailEnabled" | "smsEnabled" | "pushEnabled">, value: boolean) => {
    updateSettingsMutation.mutate({ [setting]: value });
  };

  if (!settings) {
    return (
      <Card className="notification-settings">
        <CardContent className="p-6">
          <p className="text-sm text-neutral-500">Loading notification settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="notification-settings">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-800 mb-4">
          <Bell className="text-blue-600 mr-2 inline" />
          Cài đặt thông báo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">Thông báo Email</p>
              <p className="text-xs text-neutral-500">Nhận lời nhắc hẹn qua Email</p>
            </div>
            <Switch
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => handleToggle("emailEnabled", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">Thông báo SMS </p>
              <p className="text-xs text-neutral-500">Nhận lời nhắc hẹn qua SMS</p>
            </div>
            <Switch
              checked={settings.smsEnabled}
              onCheckedChange={(checked) => handleToggle("smsEnabled", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          {/* <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">Push Notifications</p>
              <p className="text-xs text-neutral-500">Receive notifications in the app</p>
            </div>
            <Switch
              checked={settings.pushEnabled}
              onCheckedChange={(checked) => handleToggle("pushEnabled", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
