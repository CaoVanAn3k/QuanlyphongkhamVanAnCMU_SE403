import ReceptionistDashboard from "./ReceptionistDashboard";
import type { AppointmentWithDetails } from "@shared/schema";

interface ReceptionistViewProps {
  onReschedule: (appointment: AppointmentWithDetails) => void;
}

export default function ReceptionistView({ onReschedule }: ReceptionistViewProps) {
  return (
    <ReceptionistDashboard onReschedule={onReschedule} />
  );
}
