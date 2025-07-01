import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, Eye, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppointmentWithDetails } from "@shared/schema";

interface DoctorScheduleProps {
  doctorId: number;
  onReschedule: (appointment: AppointmentWithDetails) => void;
}

export default function DoctorSchedule({ doctorId, onReschedule }: DoctorScheduleProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  const { data: appointments = [] } = useQuery<AppointmentWithDetails[]>({
    queryKey: [`/api/appointments/doctor/${doctorId}`, selectedDate],
    queryKey: [`/api/appointments/doctor/${doctorId}`],
  });

  const filteredAppointments = appointments.filter(appointment => {
    if (viewMode === "day") {
      return appointment.date === selectedDate;
    }
    // For week view, show appointments within the week
    const appointmentDate = new Date(appointment.date);
    const selectedDateObj = new Date(selectedDate);
    const startOfWeek = new Date(selectedDateObj);
    startOfWeek.setDate(selectedDateObj.getDate() - selectedDateObj.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="status-badge status-badge--confirmed">Confirmed</Badge>;
      case "pending":
        return <Badge className="status-badge status-badge--pending">Pending</Badge>;
      case "cancelled":
        return <Badge className="status-badge status-badge--cancelled">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="doctor-schedule">
      <CardHeader className="doctor-schedule__header">
        <div>
          <CardTitle className="text-xl font-semibold text-neutral-800">
            <CalendarIcon className="text-blue-600 mr-2 inline" />
            My Schedule
          </CardTitle>
          <p className="text-sm text-neutral-500 mt-1">Manage your appointments and patient visits</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex rounded-md shadow-sm">
            <Button
              variant={viewMode === "day" ? "default" : "secondary"}
              size="sm"
              onClick={() => setViewMode("day")}
              className={viewMode === "day" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Day
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "secondary"}
              size="sm"
              onClick={() => setViewMode("week")}
              className={viewMode === "week" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Week
            </Button>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="doctor-schedule__table">
            <TableHeader>
              <TableRow>
                <TableHead className="doctor-schedule__table th">Time</TableHead>
                <TableHead className="doctor-schedule__table th">Patient</TableHead>
                <TableHead className="doctor-schedule__table th">Type</TableHead>
                <TableHead className="doctor-schedule__table th">Status</TableHead>
                <TableHead className="doctor-schedule__table th">Contact</TableHead>
                <TableHead className="doctor-schedule__table th">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="doctor-schedule__table td font-medium">
                      {appointment.time}
                    </TableCell>
                    <TableCell className="doctor-schedule__table td">
                      <div>
                        <p className="font-medium text-neutral-800">{appointment.patient.fullName}</p>
                        <p className="text-xs text-neutral-500">
                          {appointment.patient.dateOfBirth && `Age: ${new Date().getFullYear() - new Date(appointment.patient.dateOfBirth).getFullYear()}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="doctor-schedule__table td">
                      <span className="text-sm text-neutral-600">{appointment.type}</span>
                    </TableCell>
                    <TableCell className="doctor-schedule__table td">
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell className="doctor-schedule__table td">
                      <div className="text-xs text-neutral-500">
                        <p>{appointment.patient.phone}</p>
                        <p>{appointment.patient.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="doctor-schedule__table td">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-1">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-neutral-500 hover:text-neutral-700 p-1"
                          onClick={() => onReschedule(appointment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                    No appointments scheduled for {viewMode === "day" ? "this date" : "this week"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
