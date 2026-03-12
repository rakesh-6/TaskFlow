import Stripe from 'stripe';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res, next) => {
    try {
        const { priceId } = req.body;

        // We expect the user to have a basic Stripe customer ID if they've registered
        // For simplicity, we create one on the fly here if it's missing
        let customerId = req.user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({ email: req.user.email });
            customerId = customer.id;
            req.user.stripeCustomerId = customerId;
            await req.user.save();
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/settings/billing`,
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        next(error);
    }
};

export const createPortalSession = async (req, res, next) => {
    try {
        const { stripeCustomerId } = req.user;
        if (!stripeCustomerId) {
            return res.status(400).json({ message: 'No billing account found' });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${process.env.CLIENT_URL}/settings/billing`,
        });

        res.status(200).json({ url: portalSession.url });
    } catch (error) {
        next(error);
    }
};

export const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const user = await User.findOne({ stripeCustomerId: session.customer });
                if (user) {
                    user.subscription.plan = 'pro';
                    user.subscription.status = 'active';
                    await user.save();

                    await Notification.create({
                        user: user._id,
                        type: 'system',
                        message: 'Your Pro subscription is now active!',
                    });
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const user = await User.findOne({ stripeCustomerId: subscription.customer });
                if (user) {
                    user.subscription.plan = 'free';
                    user.subscription.status = 'inactive';
                    await user.save();

                    await Notification.create({
                        user: user._id,
                        type: 'system',
                        message: 'Your subscription has ended. You are now on the Free plan.',
                    });
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.json({ received: true });
    } catch (error) {
        console.error('Error handling webhook event', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
