import { z } from "zod";

export const payoutDetailsSchema = z.discriminatedUnion("payoutType", [
  z.object({
    payoutType: z.literal("mobile_money"),
    payoutAccountNumber: z
      .string()
      .trim()
      .min(9, "Enter a valid mobile money number")
      .max(15),
    payoutBankCode: z.string().trim().min(2, "Select a mobile money provider"),
  }),
  z.object({
    payoutType: z.literal("ghipss"),
    payoutAccountNumber: z
      .string()
      .trim()
      .min(8, "Enter a valid bank account number")
      .max(20),
    payoutBankCode: z.string().trim().min(2, "Select a bank"),
  }),
]);
