import { cache } from "react";
import { auth } from "@/auth";

/** One session lookup per request (dedupes layout + page + API). */
export const getServerSession = cache(() => auth());
