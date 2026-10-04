export const orderStatusLabels: Record<string, string> = {
  pending: "Received",
  confirmed: "Confirmed",
  preparing: "Being prepared",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const orderStatusLabel = (status: string): string => orderStatusLabels[status] ?? "Received";
