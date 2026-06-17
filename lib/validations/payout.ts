import { z } from "zod";
import { getPayoutCountry } from "@/lib/payout-countries";

const payoutCountrySchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((code) => Boolean(getPayoutCountry(code)), "Select a valid country");

export const payoutDetailsSchema = z
  .object({
    payoutCountry: payoutCountrySchema,
    payoutType: z.enum(["mobile_money", "bank"]),
    payoutAccountNumber: z.string().trim().min(8, "Enter a valid account number").max(20),
    payoutBankCode: z.string().trim().min(2, "Select a provider or bank"),
  })
  .superRefine((data, ctx) => {
    const country = getPayoutCountry(data.payoutCountry);
    if (!country) return;

    if (data.payoutType === "mobile_money" && !country.supportsMobileMoney) {
      ctx.addIssue({
        code: "custom",
        message: "Mobile money is not available for the selected country",
        path: ["payoutType"],
      });
    }
  });
