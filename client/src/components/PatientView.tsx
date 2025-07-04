import AppointmentBooking from "./AppointmentBooking";
import PatientInformation from "./PatientInformation";
import NotificationSettings from "./NotificationSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AppointmentWithDetails } from "@shared/schema";

interface PatientViewProps {
  onReschedule: (appointment: AppointmentWithDetails) => void;
}

export default function PatientView({ onReschedule }: PatientViewProps) {
  // Mock current patient ID - in real app this would come from auth
  const currentPatientId = 1;

  const { data: patientAppointments = [] } = useQuery<AppointmentWithDetails[]>({
    queryKey: [`/api/appointments/patient/${currentPatientId}`],
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Appointment Booking Component */}
      <div className="lg:col-span-2">
        <AppointmentBooking />
      </div>

      {/* Patient Information & Notifications */}
      <div className="space-y-6">
        <PatientInformation />
        <NotificationSettings patientId={currentPatientId} />

        {/* My Appointments */}
        <Card className="appointment-booking">
          <CardHeader className="appointment-booking__header">
            <CardTitle className="text-lg font-semibold text-neutral-800">
              <Calendar className="text-blue-600 mr-2 inline" />
              Các cuộc hẹn khám của tôi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {patientAppointments.length > 0 ? (
                patientAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 bg-neutral-50 rounded-md border border-neutral-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          {appointment.doctor.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {appointment.date} at {appointment.time}
                        </p>
                        <p className="text-xs text-neutral-600 mt-1">
                          {appointment.type}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`status-badge ${appointment.status === "confirmed"
                            ? "status-badge--confirmed"
                            : appointment.status === "pending"
                              ? "status-badge--pending"
                              : "status-badge--cancelled"
                            }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <button
                          className="text-xs text-blue-600 hover:text-blue-700"
                          onClick={() => onReschedule(appointment)}
                        >
                          <User className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No appointments scheduled
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
