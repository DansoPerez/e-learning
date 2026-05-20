import { prisma } from "@/lib/prisma";
import { DEFAULT_PLATFORM_COMMISSION_KEY, PLATFORM_SHARE } from "@/lib/constants";

export async function getPlatformCommission(): Promise<number> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: DEFAULT_PLATFORM_COMMISSION_KEY },
  });
  if (!setting) return PLATFORM_SHARE;
  const parsed = parseFloat(setting.value);
  return Number.isFinite(parsed) ? parsed : PLATFORM_SHARE;
}

export async function setPlatformCommission(rate: number) {
  await prisma.systemSetting.upsert({
    where: { key: DEFAULT_PLATFORM_COMMISSION_KEY },
    create: { key: DEFAULT_PLATFORM_COMMISSION_KEY, value: String(rate) },
    update: { value: String(rate) },
  });
}
