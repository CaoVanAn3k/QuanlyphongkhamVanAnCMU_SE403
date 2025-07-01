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

  const { data: availableSlots = [] } = useQuery<string[]>({
    queryKey: [`/api/appointments/available-slots/${appointment.doctorId}/${newDate}`],
    enabled: selectedAction === "reschedule" && !!newDate,
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (updates: Partial<AppointmentWithDetails>) => {
      const response = await apiRequest("PATCH", `/api/appointments/${appointment.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: selectedAction === "reschedule" ? "Appointment rescheduled successfully." : "Appointment cancelled successfully.",
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
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/appointments/${appointment.id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment cancelled successfully.",
      });
      onClose();
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
        date: data.newDate,
        time: data.newTime,
        status: "pending", // Reset to pending when rescheduled
      });
    } else {
      deleteAppointmentMutation.mutate();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-800">
            <Calendar className="text-blue-600 mr-2 inline" />
            Modify Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Appointment Info */}
          <div className="bg-neutral-50 rounded-md p-4">
            <h4 className="text-sm font-medium text-neutral-800 mb-2">Current Appointment</h4>
            <div className="text-sm text-neutral-600 space-y-1">
              <p><User className="mr-2 inline h-3 w-3" />Patient: {appointment.patient.fullName}</p>
              <p><Stethoscope className="mr-2 inline h-3 w-3" />Doctor: {appointment.doctor.name}</p>
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
                    <FormLabel className="text-sm font-medium text-neutral-800">Choose Action</FormLabel>
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
                            Reschedule Appointment
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cancel" id="cancel" />
                          <Label htmlFor="cancel" className="text-sm text-neutral-700">
                            <X className="mr-1 inline h-3 w-3 text-red-600" />
                            Cancel Appointment
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
                        <FormLabel className="text-sm font-medium text-neutral-800">New Date</FormLabel>
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
                            key={slot}
                            type="button"
                            variant="outline"
                            size="sm"
                            className={`time-slot ${
                              selectedTimeSlot === slot ? "time-slot--selected" : ""
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
                        <FormLabel className="text-sm font-medium text-neutral-800">Reason for Cancellation</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="patient-request">Patient Request</SelectItem>
                            <SelectItem value="doctor-unavailable">Doctor Unavailable</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                        <FormLabel className="text-sm font-medium text-neutral-800">Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="h-20 resize-none"
                            placeholder="Optional additional information..."
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateAppointmentMutation.isPending || deleteAppointmentMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="mr-1 h-4 w-4" />
                  {updateAppointmentMutation.isPending || deleteAppointmentMutation.isPending
                    ? "Processing..."
                    : "Confirm Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
