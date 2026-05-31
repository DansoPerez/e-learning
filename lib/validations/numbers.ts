import { z } from "zod";

export const optionalNonNegativeInt = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce
    .number({ error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .optional(),
);

export const requiredNonNegativeInt = z.coerce
  .number({ error: "Must be a number" })
  .int("Must be a whole number")
  .min(0, "Cannot be negative");

/** Treat 0 as unset (e.g. no time limit). */
export const optionalDurationMin = optionalNonNegativeInt.transform((v) =>
  v === 0 || v === undefined ? undefined : v,
);
