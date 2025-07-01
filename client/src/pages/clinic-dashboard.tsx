import { useState } from "react";
import Navigation from "@/components/Navigation";
import PatientView from "@/components/PatientView";
import DoctorView from "@/components/DoctorView";
import ReceptionistView from "@/components/ReceptionistView";
import CancelRescheduleModal from "@/components/CancelRescheduleModal";
import type { AppointmentWithDetails } from "@shared/schema";

export type UserRole = "patient" | "doctor" | "receptionist";

export default function ClinicDashboard() {
  const [currentRole, setCurrentRole] = useState<UserRole>("patient");
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);

  const handleRescheduleAppointment = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const renderCurrentView = () => {
    switch (currentRole) {
      case "patient":
        return <PatientView onReschedule={handleRescheduleAppointment} />;
      case "doctor":
        return <DoctorView onReschedule={handleRescheduleAppointment} />;
      case "receptionist":
        return <ReceptionistView onReschedule={handleRescheduleAppointment} />;
      default:
        return <PatientView onReschedule={handleRescheduleAppointment} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation currentRole={currentRole} onRoleChange={setCurrentRole} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {renderCurrentView()}
      </div>

      {showModal && selectedAppointment && (
        <CancelRescheduleModal
          appointment={selectedAppointment}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
