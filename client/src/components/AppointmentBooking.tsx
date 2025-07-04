import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, User, Calendar, Stethoscope, Clock, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertAppointmentSchema, type Doctor } from "@shared/schema";
import { z } from "zod";
import { log } from "console";

const bookingFormSchema = insertAppointmentSchema.extend({
  selectedTimeSlot: z.string().min(1, "Please select a time slot"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function AppointmentBooking() {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock current patient ID - in real app this would come from auth
  const currentPatientId = 1;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      patientId: currentPatientId,
      doctorId: 0,
      date: new Date().toISOString().split('T')[0],
      time: "",
      type: "",
      status: "pending",
      reason: "",
      selectedTimeSlot: "",
    },
  });
  console.log("Form default values:", form.getValues());

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/doctors");
      return res.json();
    },
  });


  const selectedDoctorId = form.watch("doctorId");
  const selectedDate = form.watch("date");
  const watchedDate = form.watch("date");



  const { data: availableSlots = [] } = useQuery<string[]>({
    queryKey: [`/api/appointments/available-slots/${selectedDoctorId}/${selectedDate}`],
    enabled: selectedDoctorId > 0 && !!selectedDate,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: Omit<BookingFormData, "selectedTimeSlot"> & { doctorId: number }) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: (_data, variables) => {
      const { doctorId } = variables;

      toast({
        title: "Đã đặt lịch thành công",
        description: "Cuộc hẹn của bạn đã được đặt thành công với bác sĩ.",
      });

      form.reset();
      setSelectedTimeSlot("");

      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return (
            typeof key === "string" &&
            (
              key.includes("/api/appointments/doctor") ||
              key.includes(`/api/appointments/patient/${currentPatientId}`) ||
              key.includes("todayAppointments") ||
              key.includes("pendingConfirmations") ||
              key.includes("patient-count")
            )
          );
        },
      });
      queryClient.invalidateQueries({
        queryKey: ["todayAppointments", doctorId, selectedDate],
      });

    },
  });




  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
    form.setValue("time", time);
    form.setValue("selectedTimeSlot", time);
  };

  const onSubmit = (data: BookingFormData) => {
    const { selectedTimeSlot, ...appointmentData } = data;
    createAppointmentMutation.mutate({
      ...appointmentData,
      doctorId: selectedDoctorId, // bạn cần có biến doctorId trong form hoặc context
    });
  };

  return (
    <Card className="appointment-booking">
      <CardHeader className="appointment-booking__header">
        <CardTitle className="text-xl font-semibold text-neutral-800">
          <CalendarPlus className="text-blue-600 mr-2 inline" />
          Đặt Lịch Khám
        </CardTitle>
        <p className="text-sm text-neutral-500 mt-1">Lên lịch cho bạn với các chuyên gia chăm sóc sức khỏe của chúng tôi</p>
      </CardHeader>
      <CardContent className="appointment-booking__form">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Doctor Selection */}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem className="form-group">
                  <FormLabel className="form-group__label">
                    <User className="mr-1 inline h-4 w-4" />
                    Chọn bác sĩ
                  </FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="form-group__input">
                        <SelectValue placeholder="Choose a doctor..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Selection */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="form-group">
                  <FormLabel className="form-group__label">
                    <Calendar className="mr-1 inline h-4 w-4" />
                    Chọn ngày khám
                  </FormLabel>
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

            {/* Examination Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="form-group">
                  <FormLabel className="form-group__label">
                    <Stethoscope className="mr-1 inline h-4 w-4" />
                    Loại khám bệnh
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="form-group__input">
                        <SelectValue placeholder="Select examination type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Khám tổng quát">Khám tổng quát</SelectItem>
                      <SelectItem value="Tái khám">Tái khám</SelectItem>
                      <SelectItem value="Khám da liễu">Khám da liễu</SelectItem>
                      <SelectItem value="Khám cấp cứu">Khám cấp cứu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Slots */}
            <FormField
              control={form.control}
              name="selectedTimeSlot"
              render={() => (
                <FormItem className="form-group">
                  <FormLabel className="form-group__label">
                    <Clock className="mr-1 inline h-4 w-4" />
                    Chọn khung giờ
                  </FormLabel>
                  <div className="time-slots">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        type="button"
                        variant="outline"
                        className={`time-slot ${selectedTimeSlot === slot ? "time-slot--selected" : ""
                          }`}
                        onClick={() => handleTimeSlotSelect(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason for Visit */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="form-group">
                  <FormLabel className="form-group__label">Lý do khám bệnh</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Vui lòng mô tả triệu chứng hoặc lý do khám bệnh..."
                      className="form-group__input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={createAppointmentMutation.isPending}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              <Check className="mr-2 h-4 w-4" />
              {createAppointmentMutation.isPending ? "Booking..." : "Đặt lịch khám"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
