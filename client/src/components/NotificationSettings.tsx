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
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/notification-settings/${patientId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
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
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">Email Reminders</p>
              <p className="text-xs text-neutral-500">Receive appointment reminders via email</p>
            </div>
            <Switch
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => handleToggle("emailEnabled", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">SMS Reminders</p>
              <p className="text-xs text-neutral-500">Receive appointment reminders via text message</p>
            </div>
            <Switch
              checked={settings.smsEnabled}
              onCheckedChange={(checked) => handleToggle("smsEnabled", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-800">Push Notifications</p>
              <p className="text-xs text-neutral-500">Receive notifications in the app</p>
            </div>
            <Switch
              checked={settings.pushEnabled}
              onCheckedChange={(checked) => handleToggle("pushEnabled", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
