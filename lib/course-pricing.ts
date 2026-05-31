import { PAYMENTS_ENABLED } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

/** Whether checkout should charge for this stored catalog price. */
export function chargesForCourse(storedPrice: number): boolean {
  return PAYMENTS_ENABLED && storedPrice > 0;
}

/** Student-facing price label (free while payments are disabled). */
export function studentPriceLabel(storedPrice: number): string {
  if (!chargesForCourse(storedPrice)) return "Free";
  return formatCurrency(storedPrice);
}

export function studentEnrollLabel(storedPrice: number): string {
  return chargesForCourse(storedPrice) ? "Enroll now" : "Enroll for free";
}
