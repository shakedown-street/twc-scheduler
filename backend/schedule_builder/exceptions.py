from django.core.exceptions import ObjectDoesNotExist
from rest_framework import exceptions
from rest_framework.views import exception_handler as drf_exception_handler


def exception_handler(exc, context):

    # Convert ObjectDoesNotExist to NotFound
    if isinstance(exc, ObjectDoesNotExist):
        args = exc.args
        exc = exceptions.NotFound(*(args))

    return drf_exception_handler(exc, context)
