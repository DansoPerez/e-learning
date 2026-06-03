import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { completePayment } from "@/lib/services/payment";
import { verifyPaystackSignature } from "@/lib/paystack";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    event: string;
    data: { reference: string; status: string; amount: number };
  };

  if (event.event === "charge.success" && event.data.status === "success") {
    const payment = await prisma.payment.findUnique({
      where: { reference: event.data.reference },
    });
    if (
      payment &&
      payment.status === "PENDING" &&
      event.data.amount === Math.round(payment.amount * 100)
    ) {
      await completePayment(event.data.reference);
    }
  }

  return NextResponse.json({ received: true });
}
