import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AppointmentsDetailModalProps {
  type: "today" | "pending" | "patients";
  data: any[];
  onClose: () => void;
}

export default function AppointmentsDetailModal({ type, data, onClose }: AppointmentsDetailModalProps) {
  const getTitle = () => {
    if (type === "today") return "Các cuộc hẹn hôm nay";
    if (type === "pending") return "Chờ xác nhận";
    return "Tổng số bệnh nhân";
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {data.length === 0 ? (
            <p className="text-sm text-neutral-500">No data found.</p>
          ) : (
            data.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-2 border rounded-md text-sm flex justify-between items-center"
              >
                {type === "patients" ? (
                  <>
                    <span>{item.fullName}</span>
                    <span>{item.email}</span>
                  </>
                ) : (
                  <>
                    <span>{item.time}</span>
                    <span>{item.date}</span>

                    <span>{item.patient.fullName}</span>
                    <span className="capitalize">{item.status}</span>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
