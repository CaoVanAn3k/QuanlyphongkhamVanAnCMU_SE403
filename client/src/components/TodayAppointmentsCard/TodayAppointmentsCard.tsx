import { Card, CardContent } from "@/components/ui/card";

interface TodayAppointmentsCardProps {
  count: number;
  onClick?: () => void;
}

export default function TodayAppointmentsCard({ count, onClick }: TodayAppointmentsCardProps) {
  return (
    <Card
      onClick={onClick}
      className="w-full cursor-pointer hover:shadow-lg transition-shadow"
    >
      <CardContent className="p-4">
        <div className="text-sm text-neutral-500 mb-1">Các cuộc hẹn hôm nay</div>
        <div className="text-2xl font-bold text-green-600">{count}</div>
      </CardContent>
    </Card>
  );
}
