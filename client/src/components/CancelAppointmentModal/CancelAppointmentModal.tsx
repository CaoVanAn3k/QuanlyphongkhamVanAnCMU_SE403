// components/CancelAppointmentModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => void;
}

export function CancelAppointmentModal({ open, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onConfirm(reason, notes);
    setReason("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Huỷ lịch hẹn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Lý do huỷ"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Textarea
            placeholder="Ghi chú thêm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Huỷ</Button>
            <Button onClick={handleSubmit} className="bg-red-600 text-white hover:bg-red-700">
              Xác nhận huỷ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
