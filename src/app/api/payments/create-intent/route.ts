import { NextResponse } from 'next/server';
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { user_credits } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { ensureStripeCustomer, getStripe } from "@/lib/stripe";
import Stripe from 'stripe';

export const runtime = "edge";

export async function POST(request: Request) {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { amount?: number };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.amount || typeof body.amount !== 'number' || body.amount < 5 || body.amount > 100000) {
        return NextResponse.json({ error: "Amount must be a number between 5 and 100000" }, { status: 400 });
    }

    try {
        const stripe = getStripe();

        const stripeCustomerId = await ensureStripeCustomer(
            user.id,
            user.email || undefined,
            user.name || undefined
        );

        const paymentMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
            type: 'card',
        });
        
        if (paymentMethods.data.length === 0) {
            return NextResponse.json({ error: "No payment method on file" }, { status: 400 });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(body.amount * 100),
            currency: 'usd',
            customer: stripeCustomerId,
            payment_method: paymentMethods.data[0].id,
            off_session: true,
            confirm: true,
            metadata: {
                userId: user.id,
                userEmail: user.email || '',
                userName: user.name || '',
                creditAmount: body.amount.toString()
            }
        });

        if (paymentIntent.status === 'succeeded') {
            const userCredit = await db.query.user_credits.findFirst({
                where: eq(user_credits.userId, user.id),
            });

            if (userCredit) {
                await db.update(user_credits)
                    .set({ 
                        balance: sql`${user_credits.balance} + ${body.amount}`,
                        lastUpdated: new Date()
                    })
                    .where(eq(user_credits.userId, user.id));
            } else {
                await db.insert(user_credits).values({
                    userId: user.id,
                    balance: body.amount,
                });
            }

            return NextResponse.json({ 
                success: true,
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status
            });
        }

        return NextResponse.json({ 
            success: false,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            clientSecret: paymentIntent.client_secret,
            error: "Payment requires additional authentication or action"
        }, { status: 402 });

    } catch (error: any) {
        console.error('Error creating payment intent:', error);
        if (error instanceof Stripe.errors.StripeError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
    }
}
