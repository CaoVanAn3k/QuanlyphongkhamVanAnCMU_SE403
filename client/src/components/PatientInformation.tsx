import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { insertPatientSchema } from "@shared/schema";
import { z } from "zod";

const patientFormSchema = insertPatientSchema.extend({
  reason: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

export default function PatientInformation() {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      fullName: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1988-03-15",
      address: "123 Main St",
      reason: "Routine check-up and consultation about recent headaches",
    },
  });

  const onSubmit = (data: PatientFormData) => {
    console.log("Patient info updated:", data);
    setIsEditing(false);
    // In real app, this would call the API to update patient info
  };

  return (
    <Card className="appointment-booking">
      <CardHeader className="appointment-booking__header">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-neutral-800">
            <User className="text-blue-600 mr-2 inline" />
            Patient Information
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit"}
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
                  <FormLabel className="form-group__label">Full Name</FormLabel>
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
                  <FormLabel className="form-group__label">Email Address</FormLabel>
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
                  <FormLabel className="form-group__label">Phone Number</FormLabel>
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

            <FormField
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
            />

            {isEditing && (
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
