import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { insertPatientSchema } from "@shared/schema";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";

const patientFormSchema = insertPatientSchema.extend({
  reason: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;
const currentPatientId = 1;
export default function PatientInformation() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      // reason: "",
    },
  });
  // Lấy thông tin bệnh nhân
  const { data: patientData, isLoading } = useQuery<PatientFormData>({
    queryKey: ["patient", currentPatientId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/patients/${currentPatientId}`);
      return res.json();
    },
  });

  useEffect(() => {
    if (patientData) {
      form.reset(patientData);
    }
  }, [patientData]);

  //cập nhật thông tin
  const updatePatientMutation = useMutation({
    mutationFn: (data: PatientFormData) =>
      apiRequest("PUT", `/api/patients/${currentPatientId}`, data),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["patient", currentPatientId] });
    },
  });

  const onSubmit = (data: PatientFormData) => {
    console.log("Patient info updated:", data);
    setIsEditing(false);
    updatePatientMutation.mutate(data);
  };

  return (
    <Card className="appointment-booking">
      <CardHeader className="appointment-booking__header">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-neutral-800">
            <User className="text-blue-600 mr-2 inline" />
            Thông tin bệnh nhân
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Huỷ" : "Chỉnh sửa"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="appointment-booking__form">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="form-group">
                  <FormLabel className="form-group__label">Họ và tên</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!isEditing}
                      className="form-group__input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="form-group">
                  <FormLabel className="form-group__label">Email </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      disabled={!isEditing}
                      className="form-group__input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="form-group">
                  <FormLabel className="form-group__label">Số điện thoại</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      {...field}
                      disabled={!isEditing}
                      className="form-group__input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="form-group">
                  <FormLabel className="form-group__label">Reason for Visit</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={!isEditing}
                      className="form-group__input h-20 resize-none"
                      placeholder="Please describe your symptoms or reason for the visit..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {isEditing && (
              <Button type="submit" disabled={updatePatientMutation.isPending} className="w-full">
                Lưu thông tin
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
