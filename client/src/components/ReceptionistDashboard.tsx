import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Plus, Search, Eye, Edit, Check, X, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AppointmentWithDetails, Doctor } from "@shared/schema";

interface ReceptionistDashboardProps {
  onReschedule: (appointment: AppointmentWithDetails) => void;
}

export default function ReceptionistDashboard({ onReschedule }: ReceptionistDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointments, setSelectedAppointments] = useState<number[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<AppointmentWithDetails> }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment updated successfully.",
      });
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
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/appointments/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment cancelled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment.",
        variant: "destructive",
      });
    },
  });

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = 
      appointment.patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDoctor = !filterDoctor || appointment.doctor.id.toString() === filterDoctor;
    const matchesStatus = !filterStatus || appointment.status === filterStatus;
    const matchesDate = !filterDate || appointment.date === filterDate;

    return matchesSearch && matchesDoctor && matchesStatus && matchesDate;
  });

  const handleSelectAppointment = (appointmentId: number, selected: boolean) => {
    if (selected) {
      setSelectedAppointments([...selectedAppointments, appointmentId]);
    } else {
      setSelectedAppointments(selectedAppointments.filter(id => id !== appointmentId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedAppointments(filteredAppointments.map(apt => apt.id));
    } else {
      setSelectedAppointments([]);
    }
  };

  const handleBulkAction = (action: "confirm" | "cancel") => {
    selectedAppointments.forEach((id) => {
      const status = action === "confirm" ? "confirmed" : "cancelled";
      updateAppointmentMutation.mutate({ id, updates: { status } });
    });
    setSelectedAppointments([]);
  };

  const handleConfirmAppointment = (id: number) => {
    updateAppointmentMutation.mutate({ id, updates: { status: "confirmed" } });
  };

  const handleCancelAppointment = (id: number) => {
    deleteAppointmentMutation.mutate(id);
  };

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
    <Card className="dashboard">
      <CardHeader className="dashboard__header">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold text-neutral-800">
              <BarChart3 className="text-blue-600 mr-2 inline" />
              Receptionist Dashboard
            </CardTitle>
            <p className="text-sm text-neutral-500 mt-1">Manage all clinic appointments and patient information</p>
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </CardHeader>

      {/* Filters and Search */}
      <div className="dashboard__filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Doctor</label>
            <Select value={filterDoctor} onValueChange={setFilterDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Doctors</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Date Range</label>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <CardContent className="dashboard__content">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-neutral-200">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedAppointments.length === filteredAppointments.length && filteredAppointments.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-neutral-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedAppointments.includes(appointment.id)}
                        onCheckedChange={(checked) => handleSelectAppointment(appointment.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{appointment.patient.fullName}</p>
                        <p className="text-xs text-neutral-500">{appointment.patient.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-neutral-800">{appointment.doctor.name}</p>
                      <p className="text-xs text-neutral-500">{appointment.doctor.specialty}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-neutral-800">{appointment.date}</p>
                      <p className="text-xs text-neutral-500">{appointment.time}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-neutral-600">{appointment.type}</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-1" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700 p-1" 
                          title="Confirm"
                          onClick={() => handleConfirmAppointment(appointment.id)}
                          disabled={appointment.status === "confirmed"}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 p-1" 
                          title="Cancel"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-neutral-500 hover:text-neutral-700 p-1" 
                          title="Reschedule"
                          onClick={() => onReschedule(appointment)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                    No appointments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bulk Actions */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-500">Bulk actions:</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700"
              onClick={() => handleBulkAction("confirm")}
              disabled={selectedAppointments.length === 0}
            >
              <Check className="mr-1 h-3 w-3" />
              Confirm Selected
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => handleBulkAction("cancel")}
              disabled={selectedAppointments.length === 0}
            >
              <X className="mr-1 h-3 w-3" />
              Cancel Selected
            </Button>
          </div>

          {/* Pagination placeholder */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-600">Page 1 of 1</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
