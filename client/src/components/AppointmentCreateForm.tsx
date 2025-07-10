import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface Doctor {
  id: number;
  name: string;
}

interface AppointmentFormData {
  patientName: string;
  patientDob?: string;
  patientAddress: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  notes?: string;
}

const types = [
  "Khám tổng quát",
  "Khám nhi",
  "Khám tim mạch",
  "Khám da liễu",
  "Khám tai mũi họng",
];
type Props = {
  onSuccess?: () => void;
};

const AppointmentCreateForm = ({ onSuccess }: Props) => {
  const { toast } = useToast();
  const form = useForm<AppointmentFormData>();
  const { register, handleSubmit, setValue, watch, reset } = form;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors");
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách bác sĩ",
          variant: "destructive",
        });
      }
    };
    fetchDoctors();
  }, [toast]);

  const onSubmit = async (values: AppointmentFormData) => {
    setLoading(true);
    try {
      // Gọi API kiểm tra hoặc tạo bệnh nhân
      const patientRes = await apiRequest("POST", "/api/patients/check-or-create", {
        fullName: values.patientName,
        email: values.patientEmail,
        phone: values.patientPhone,
        dateOfBirth: values.patientDob,
        address: values.patientAddress,
      });

      if (!patientRes.ok) throw new Error("Không thể xử lý thông tin bệnh nhân");
      const { patientId } = await patientRes.json();


      // Gửi dữ liệu tạo lịch khám
      const response = await apiRequest("POST", "/api/appointments", {
        patientId,
        doctorId: Number(values.doctorId), // ⚠️ Ép kiểu tại đây
        date: values.date,
        time: values.time,
        type: values.type,
        notes: values.notes,
      });

      if (!response.ok) throw new Error("Lỗi khi tạo cuộc hẹn");

      toast({ title: "Thành công", description: "Đã tạo cuộc hẹn" });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      reset({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        patientDob: "",
        patientAddress: "",
        doctorId: "", // 🔁 Reset Select về trạng thái chưa chọn bác sĩ
        date: "",
        time: "",
        type: "", // 🔁 Reset Select về chưa chọn loại khám
        notes: "",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Thất bại",
        description: "Tạo cuộc hẹn thất bại. Vui lòng kiểm tra lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold text-neutral-800">Tạo cuộc hẹn mới</h2>
      <div className="flex justify-between">
        <div>
          <div className="w-[250px]">
            <label className="text-sm font-medium">Tên bệnh nhân</label>
            <Input {...register("patientName", { required: true })} placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="text-sm font-medium">Ngày sinh</label>
            <Input
              type="date"
              {...register("patientDob")}
              className="form-input"
              placeholder="Chọn ngày sinh"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Địa chỉ bệnh nhân</label>
            <Input {...register("patientAddress", { required: "Vui lòng nhập địa chỉ" })} />

          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input {...register("patientEmail", { required: true })} type="email" placeholder="example@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium">Số điện thoại</label>
            <Input {...register("patientPhone", { required: true })} placeholder="0909xxxxxx" />
          </div>
        </div>
        <div>
          <div className="w-[250px]">
            <label className="text-sm font-medium">Bác sĩ</label>
            <Select value={watch("doctorId")} onValueChange={(val) => form.setValue("doctorId", (val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn bác sĩ" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id.toString()}>{doc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Loại khám</label>
            <Select value={watch("type")} onValueChange={(val) => setValue("type", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại khám" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type, idx) => (
                  <SelectItem key={idx} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Ngày</label>
            <Input {...register("date", { required: true })} type="date" />
          </div>

          <div>
            <label className="text-sm font-medium">Giờ</label>
            <Input {...register("time", { required: true })} type="time" />
          </div>

          <div>
            <label className="text-sm font-medium">Ghi chú</label>
            <Textarea {...register("notes")} placeholder="Ghi chú thêm (tuỳ chọn)" />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="bg-blue-600 text-white w-full">
        {loading ? "Đang tạo..." : "Tạo cuộc hẹn"}
      </Button>
    </form>
  );
};

export default AppointmentCreateForm;
