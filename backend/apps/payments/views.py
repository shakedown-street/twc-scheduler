import logging

import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import exceptions, permissions, status, viewsets
from rest_framework.response import Response

from apps.payments.models import UserSubscription

logger = logging.getLogger(__name__)

User = get_user_model()


class CheckoutSessionViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        # Ensure the price exists in Stripe
        try:
            stripe.Price.retrieve(settings.STRIPE_PRICE_ID)
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            raise exceptions.APIException(
                "An error occurred while retrieving the price."
            )

        # Ensure the user does not have an active subscription
        if request.user.subscriptions.filter(subscription_status="active").exists():
            raise exceptions.PermissionDenied(
                "User already has an active subscription."
            )

        # Check if user has a customer ID (from a previous or inactive subscription)
        customer_id = (
            request.user.subscriptions.first().customer_id
            if request.user.subscriptions.exists()
            else None
        )

        try:
            session = stripe.checkout.Session.create(
                ui_mode="embedded",
                line_items=[{"price": settings.STRIPE_PRICE_ID, "quantity": 1}],
                mode="subscription",
                return_url=settings.STRIPE_CHECKOUT_RETURN_URL,
                metadata={
                    "user_id": request.user.id,
                },
                customer=customer_id,
            )

            client_secret = session.client_secret

            return Response({"client_secret": client_secret})
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            raise exceptions.APIException(
                "An error occurred while creating the checkout session."
            )

    def retrieve(self, request, pk=None):
        try:
            session = stripe.checkout.Session.retrieve(pk)

            return Response(session)
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            raise exceptions.APIException(
                "An error occurred while retrieving the checkout session."
            )


class BillingSessionViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        if not request.user.subscriptions.exists():
            raise exceptions.APIException("User does not have a customer ID.")

        try:
            customer_id = request.user.subscriptions.first().customer_id

            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=settings.STRIPE_BILLING_PORTAL_RETURN_URL,
            )

            return Response(session)
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            raise exceptions.APIException(
                "An error occurred while creating the billing portal session."
            )


def fulfill_checkout(session_id):
    session = stripe.checkout.Session.retrieve(session_id, expand=["subscription"])

    if session.payment_status == "unpaid":
        return

    user_id = session.metadata.get("user_id")
    user = User.objects.get(id=user_id)

    customer_id = session["customer"]
    subscription_id = session["subscription"]["id"]
    subscription_status = session["subscription"]["status"]
    product_id = session["subscription"]["items"]["data"][0]["price"]["product"]

    UserSubscription.objects.create(
        user=user,
        customer_id=customer_id,
        subscription_id=subscription_id,
        subscription_status=subscription_status,
        product_id=product_id,
    )


def handle_subscription_update(subscription):
    customer_id = subscription["customer"]
    product_id = subscription["plan"]["product"]
    subscription_id = subscription["id"]
    subscription_status = subscription["status"]

    try:
        user_subscription = UserSubscription.objects.get(
            subscription_id=subscription_id,
        )
        user_subscription.product_id = product_id
        user_subscription.customer_id = customer_id
        user_subscription.subscription_status = subscription_status
        user_subscription.save()
    except ObjectDoesNotExist:
        pass


@csrf_exempt
def stripe_webhook(request):
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise ValueError("STRIPE_WEBHOOK_SECRET is not set")

    payload = request.body
    sig_header = request.META["HTTP_STRIPE_SIGNATURE"]
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse(status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=status.HTTP_400_BAD_REQUEST)

    if event["type"] in [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
    ]:
        session = event["data"]["object"]
        fulfill_checkout(session.id)
    elif event["type"] in [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    ]:
        subscription = event["data"]["object"]
        handle_subscription_update(subscription)

    return HttpResponse(status=status.HTTP_200_OK)
