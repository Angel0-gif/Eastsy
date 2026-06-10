import requests
import base64
from django.conf import settings

MOMO_BASE_URL = "https://sandbox.momodeveloper.mtn.com"


def get_access_token() -> str:
    credentials = base64.b64encode(
        f"{settings.MTN_MOMO_API_USER}:{settings.MTN_MOMO_API_KEY}".encode()
    ).decode()

    response = requests.post(
        f"{MOMO_BASE_URL}/collection/token/",
        headers={
            "Authorization": f"Basic {credentials}",
            "Ocp-Apim-Subscription-Key": settings.MTN_MOMO_SUBSCRIPTION_KEY,
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def request_payment(phone: str, amount: int, reference: str, note: str) -> dict:
    token = get_access_token()

    payload = {
        "amount":    str(amount),
        "currency":  "XAF",
        "externalId": reference,
        "payer": {
            "partyIdType": "MSISDN",
            "partyId":     phone.replace("+", ""),
        },
        "payerMessage": note,
        "payeeNote":    note,
    }

    response = requests.post(
        f"{MOMO_BASE_URL}/collection/v1_0/requesttopay",
        json=payload,
        headers={
            "Authorization":             f"Bearer {token}",
            "X-Reference-Id":            reference,
            "X-Target-Environment":      "sandbox",
            "Ocp-Apim-Subscription-Key": settings.MTN_MOMO_SUBSCRIPTION_KEY,
            "Content-Type":              "application/json",
        },
        timeout=15,
    )

    if response.status_code == 202:
        return {"status": "pending", "reference": reference}

    response.raise_for_status()


def check_payment_status(reference: str) -> str:
    token = get_access_token()

    response = requests.get(
        f"{MOMO_BASE_URL}/collection/v1_0/requesttopay/{reference}",
        headers={
            "Authorization":             f"Bearer {token}",
            "X-Target-Environment":      "sandbox",
            "Ocp-Apim-Subscription-Key": settings.MTN_MOMO_SUBSCRIPTION_KEY,
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json().get("status", "FAILED")