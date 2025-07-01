import { Stethoscope, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserRole } from "@/pages/clinic-dashboard";

interface NavigationProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Navigation({ currentRole, onRoleChange }: NavigationProps) {
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "patient":
        return <User className="h-4 w-4 mr-2" />;
      case "doctor":
        return <Stethoscope className="h-4 w-4 mr-2" />;
      case "receptionist":
        return <User className="h-4 w-4 mr-2" />;
      default:
        return <User className="h-4 w-4 mr-2" />;
    }
  };

  const roleLabels = {
    patient: "Patient",
    doctor: "Doctor",
    receptionist: "Receptionist"
  };

  return (
    <>
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Stethoscope className="text-blue-600 text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-neutral-800">ClinicCare Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-800">
                <Bell className="h-4 w-4 mr-1" />
                Notifications
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" alt="Profile" />
                  <AvatarFallback>DS</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-neutral-800">Dr. Smith</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Role Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-neutral-800">View as:</span>
            <div className="flex space-x-2">
              {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                <Button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  variant={currentRole === role ? "default" : "secondary"}
                  size="sm"
                  className={currentRole === role ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {getRoleIcon(role)}
                  {roleLabels[role]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
