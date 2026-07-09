import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const createPaymentUrlForStripe = async (
  rentalRequestId: string,
  tenantId: string,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUniqueOrThrow({
      where: {
        rentalRequestId,
        tenantId,
      },
    });

    const totalAmount = Math.round(payment.amount.toNumber() * 100);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "bdt",
            unit_amount: totalAmount,
            product_data: { name: "Pay for your property" },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${config.app_url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.app_url}/cancel`,
      metadata: {
        tenantId,
        paymentId: payment.id,
        rentalRequestId,
      },
    });

    return session.url;
  });

  return {
    transactionResult,
  };
};

export const paymentService = {
  createPaymentUrlForStripe,
};
