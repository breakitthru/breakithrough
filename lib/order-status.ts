// Shared order-status vocabulary for the member orders page and the admin panel,
// so both read the same lifecycle. Physical goods flow: Paid -> Shipped -> Delivered.

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "FULFILLED"
  | "CANCELLED"
  | "FAILED";

/** The three visible steps of a healthy (non-cancelled) order. */
export const ORDER_STEPS = [
  { key: "PAID", label: "Paid", blurb: "Payment received" },
  { key: "SHIPPED", label: "Shipped", blurb: "On the way" },
  { key: "DELIVERED", label: "Delivered", blurb: "Arrived" },
] as const;

/** How far along the stepper a status sits (0-based index into ORDER_STEPS). */
export function stepIndex(status: OrderStatus): number {
  switch (status) {
    case "PAID":
      return 0;
    case "SHIPPED":
      return 1;
    case "DELIVERED":
    case "FULFILLED": // legacy "done"
      return 2;
    default:
      return 0;
  }
}

export function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "Awaiting payment";
    case "PAID":
      return "Paid · being packed";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "FULFILLED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "FAILED":
      return "Payment failed";
  }
}

export function statusTone(status: OrderStatus): "success" | "caution" | "neutral" | "crisis" | "brand" {
  switch (status) {
    case "DELIVERED":
    case "FULFILLED":
      return "success";
    case "SHIPPED":
      return "brand";
    case "PAID":
      return "caution";
    case "FAILED":
      return "crisis";
    default:
      return "neutral";
  }
}
