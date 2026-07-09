import Stripe from "stripe";
import { prisma } from "../../lib/prisma";

export const handleFulfillPayment = async (
  session: Stripe.Checkout.Session,
) => {
  const { paymentId, rentalRequestId, propertyId } = session.metadata ?? {};

  if (!paymentId) {
    console.error(`No paymentId in metadata for session ${session.id}`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: {
        id: paymentId,
      },
    });

    if (!payment) {
      console.error(`Payment ${paymentId} not found for session ${session.id}`);
      return;
    }

    await tx.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        paidAt: new Date(),
        transactionId: session.payment_intent as string,
        status: "COMPLETED",
      },
    });

    await tx.rentalRequest.update({
      where: {
        id: rentalRequestId,
      },
      data: {
        status: "ACTIVE",
      },
    });

    await tx.property.update({
      where: {
        id: propertyId,
      },
      data: {
        status: "RENTED",
      },
    });
  });
};
