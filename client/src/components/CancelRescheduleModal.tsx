import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, User, Stethoscope, Clock, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AppointmentWithDetails } from "@shared/schema";
import { z } from "zod";

interface CancelRescheduleModalProps {
  appointment: AppointmentWithDetails;
  onClose: () => void;
}

const modalFormSchema = z.object({
  action: z.enum(["reschedule", "cancel"]),

  newDate: z.string().optional(),
  newTime: z.string().optional(),
  cancellationReason: z.string().optional(),
  cancellationNotes: z.string().optional(),
});

type ModalFormData = z.infer<typeof modalFormSchema>;

export default function CancelRescheduleModal({ appointment, onClose }: CancelRescheduleModalProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ModalFormData>({
    resolver: zodResolver(modalFormSchema),
    defaultValues: {
      action: "reschedule",
      newDate: "",
      newTime: "",
      cancellationReason: "",
      cancellationNotes: "",
    },
  });

  const selectedAction = form.watch("action");
  const newDate = form.watch("newDate");
  const newTime = form.watch("newTime");

  const { data: availableSlots = [] } = useQuery<string[]>({
    queryKey: [`/api/appointments/available-slots/${appointment.doctorId}/${newDate}`],
    enabled: selectedAction === "reschedule" && !!newDate,
  });
  const currentPatientId = 1;

  // const updateAppointmentMutation = useMutation({
  //   mutationFn: async (updates: Partial<AppointmentWithDetails>) => {
  //     const response = await apiRequest("PATCH", `/api/appointments/${currentPatientId}`, updates);
  //     return response.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       predicate: (query) =>
  //         typeof query.queryKey[0] === "string" &&
  //         query.queryKey[0].includes("/api/appointments/patient"),
  //     });
  //     toast({
  //       title: "Success",
  //       description: selectedAction === "reschedule" ? "Appointment rescheduled successfully." : "Appointment cancelled successfully.",
  //     });
  //     onClose();
  //   },
  //   onError: () => {
  //     toast({
  //       title: "Error",
  //       description: "Failed to update appointment.",
  //       variant: "destructive",
  //     });
  //   },
  // });
  const updateAppointmentMutation = useMutation({
    mutationFn: async (updates: Partial<AppointmentWithDetails> & { id: number }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${updates.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].includes("/api/appointments"),
      });
      toast({
        title: "Success",
        description:
          selectedAction === "reschedule"
            ? "Appointment rescheduled successfully."
            : "Appointment cancelled successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment.",
        variant: "destructive",
      });
    },
  });


  const deleteAppointmentMutation = useMutation({
    mutationFn: async (body: { appointmentId: number; reason?: string; notes?: string }) => {
      const res = await fetch(`/api/appointments/${body.appointmentId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: body.reason,
          notes: body.notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to cancel");
      return res.json();
    },

    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment cancelled successfully.",
      });

      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return (
            typeof key === "string" &&
            (
              key.includes("/api/appointments") ||        // bệnh nhân / bác sĩ
              key.includes("todayAppointments") ||
              key.includes("pendingConfirmations") ||
              key.includes("patients")
            )
          );
        },
      });

      onClose(); // đóng modal
    },

    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment.",
        variant: "destructive",
      });
    },
  });




  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
    form.setValue("newTime", time);
  };

  const onSubmit = (data: ModalFormData) => {
    if (data.action === "reschedule") {
      if (!data.newDate || !data.newTime) {
        toast({
          title: "Error",
          description: "Please select a new date and time.",
          variant: "destructive",
        });
        return;
      }
      updateAppointmentMutation.mutate({
        id: appointment.id, // ID của cuộc hẹn
        date: newDate,       // Ngày mới (nếu reschedule)
        time: newTime,
        status: "pending", // hoặc giữ nguyên status
      });

    } else {
      deleteAppointmentMutation.mutate({
        appointmentId: appointment.id,
        reason: form.getValues("cancellationReason"),
        notes: form.getValues("cancellationNotes"),
      });



    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-800">
            <Calendar className="text-blue-600 mr-2 inline" />
            Sửa đổi cuộc hẹn
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Appointment Info */}
          <div className="bg-neutral-50 rounded-md p-4">
            <h4 className="text-sm font-medium text-neutral-800 mb-2">Cuộc hẹn hiện tại</h4>
            <div className="text-sm text-neutral-600 space-y-1">
              <p><User className="mr-2 inline h-3 w-3" />Bệnh nhân: {appointment.patient.fullName}</p>
              <p><Stethoscope className="mr-2 inline h-3 w-3" />Bác sĩ: {appointment.doctor.name}</p>
              <p><Calendar className="mr-2 inline h-3 w-3" />Date: {appointment.date}</p>
              <p><Clock className="mr-2 inline h-3 w-3" />Time: {appointment.time}</p>
              <p><Stethoscope className="mr-2 inline h-3 w-3" />Type: {appointment.type}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Action Selection */}
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-800">Chọn hành động</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="reschedule" id="reschedule" />
                          <Label htmlFor="reschedule" className="text-sm text-neutral-700">
                            <Calendar className="mr-1 inline h-3 w-3 text-blue-600" />
                            Cuộc hẹn sắp xếp lại
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cancel" id="cancel" />
                          <Label htmlFor="cancel" className="text-sm text-neutral-700">
                            <X className="mr-1 inline h-3 w-3 text-red-600" />
                            Hủy cuộc hẹn

                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reschedule Options */}
              {selectedAction === "reschedule" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="newDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">Ngày mới</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            min={new Date().toISOString().split('T')[0]}
                            className="form-group__input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {newDate && (
                    <div>
                      <Label className="text-sm font-medium text-neutral-800">Available Time Slots</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {availableSlots.map((slot) => (
                          <Button
                            name="newTime"
                            key={slot}
                            type="button"
                            variant="outline"
                            size="sm"
                            className={`time-slot ${selectedTimeSlot === slot ? "time-slot--selected" : ""
                              }`}
                            onClick={() => handleTimeSlotSelect(slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cancellation Options */}
              {selectedAction === "cancel" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cancellationReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">Lý do hủy bỏ</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn lý do ..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Trường hợp khẩn cấp của bác sĩ">Trường hợp khẩn cấp của bác sĩ</SelectItem>
                            <SelectItem value="Bác sĩ ốm/không khỏe">Bác sĩ ốm/không khỏe</SelectItem>
                            <SelectItem value="Sự cố kỹ thuật/cơ sở vật chất">Sự cố kỹ thuật/cơ sở vật chất</SelectItem>
                            <SelectItem value="Phòng khám quá tải">Phòng khám quá tải</SelectItem>
                            <SelectItem value="Vấn đề về nhân sự">Vấn đề về nhân sự</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cancellationNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-800">Ghi chú bổ sung</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="h-20 resize-none"
                            placeholder="Nội dung ghi chú về việc hủy cuộc hẹn..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={onClose} type="button">
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  disabled={updateAppointmentMutation.isPending || deleteAppointmentMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="mr-1 h-4 w-4" />
                  {updateAppointmentMutation.isPending || deleteAppointmentMutation.isPending
                    ? "Processing..."
                    : "Xác nhận thay đổi"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
