import DoctorSchedule from "./DoctorSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Clock, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AppointmentWithDetails } from "@shared/schema";
import TodayAppointmentsCard from "./TodayAppointmentsCard/TodayAppointmentsCard";
import PendingConfirmationsCard from "./PendingConfirmationsCard/PendingConfirmationsCard";
import TotalPatientsCard from "./TotalPatientsCard/TotalPatientsCard";
import { useState } from "react";
import AppointmentsDetailModal from "./AppointmentsDetailModal/AppointmentsDetailModal";

interface DoctorViewProps {
  onReschedule: (appointment: AppointmentWithDetails) => void;
}

export default function DoctorView({ onReschedule }: DoctorViewProps) {
  // Mock current doctor ID - in real app this would come from auth
  const currentDoctorId = 1;

  const { data: appointments = [] } = useQuery<AppointmentWithDetails[]>({
    queryKey: [`/api/appointments/doctor/${currentDoctorId}`],
  });

  // const todayAppointments = appointments.filter(apt => {
  //   const today = new Date().toISOString().split('T')[0];
  //   return apt.date === today;
  // }).length;

  // const pendingAppointments = appointments.filter(apt => apt.status === "pending").length;

  // const uniquePatients = new Set(appointments.map(apt => apt.patientId)).size;
  const [selectedType, setSelectedType] = useState<"today" | "pending" | "patients" | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });


  const doctorId = 1;
  const { data: todayAppointments = [] } = useQuery({
    queryKey: ["todayAppointments", doctorId, selectedDate],
    queryFn: async () =>
      fetch(`/api/doctor/${doctorId}/today-appointments?date=${selectedDate}`).then((res) =>
        res.json()
      ),
  });

  const { data: pendingConfirmations = [] } = useQuery({
    queryKey: ["pendingConfirmations", doctorId],
    queryFn: async () =>
      fetch(`/api/doctor/${doctorId}/pending-confirmations`).then((res) => res.json()),
  });

  const { data: totalPatients = [] } = useQuery({
    queryKey: ["patients", doctorId],
    queryFn: async () => fetch(`/api/doctor/${doctorId}/patients`).then((res) => res.json()),
  });


  return (
    <div className="space-y-6">
      <DoctorSchedule doctorId={currentDoctorId} selectedDate={selectedDate}
        setSelectedDate={setSelectedDate} onReschedule={onReschedule} />

      {/* Doctor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <CardContent className="p-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarCheck className="text-green-600 text-2xl" />
              </div>
              {/* <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Today's Appointments</p>
                <p className="text-2xl font-semibold text-neutral-800">{todayAppointments}</p>
              </div> */}
              <TodayAppointmentsCard count={todayAppointments.length} onClick={() => setSelectedType("today")} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <CardContent className="p-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="text-yellow-500 text-2xl" />
              </div>
              {/* <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Pending Confirmations</p>
                <p className="text-2xl font-semibold text-neutral-800">{pendingAppointments}</p>
              </div> */}
              <PendingConfirmationsCard count={pendingConfirmations.length} onClick={() => setSelectedType("pending")} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <CardContent className="p-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="text-blue-600 text-2xl" />
              </div>
              {/* <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Total Patients</p>
                <p className="text-2xl font-semibold text-neutral-800">{uniquePatients}</p>
              </div> */}
              <TotalPatientsCard count={totalPatients.length} onClick={() => setSelectedType("patients")} />
            </div>
          </CardContent>
        </Card>
        {selectedType && (
          <AppointmentsDetailModal
            type={selectedType}
            data={
              selectedType === "today"
                ? todayAppointments
                : selectedType === "pending"
                  ? pendingConfirmations
                  : totalPatients
            }
            onClose={() => setSelectedType(null)}
          />
        )}
      </div>
    </div>
  );
}
