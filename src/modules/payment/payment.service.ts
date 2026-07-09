import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { handleFulfillPayment } from "./payment.utils";

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

    const rentalRequest = await tx.rentalRequest.findUniqueOrThrow({
      where: {
        id: rentalRequestId,
      },
    });

    const totalAmount = Math.round(payment.amount.toNumber() * 100);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "bdt",
            unit_amount: totalAmount,
            product_data: {
              name: "Pay for your property",
              description: `Rental period: starts from ${rentalRequest.moveInDate} and ends in after ${rentalRequest.durationMonths} month.`,
            },
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
        propertyId: rentalRequest.propertyId,
      },
    });

    return session.url;
  });

  return {
    transactionResult,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        await handleFulfillPayment(session);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}.`);
      break;
  }
};

export const paymentService = {
  createPaymentUrlForStripe,
  handleWebhook,
};
