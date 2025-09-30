from apps.appointments.models import Schedule


class ScheduleMiddleware:
    """
    Middleware to extract 'X-Schedule-ID' from request headers and attach it to the request object.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        schedule_id = request.headers.get("X-Schedule-ID")
        if schedule_id:
            try:
                schedule = Schedule.objects.get(id=schedule_id)
                request.schedule = schedule
            except Schedule.DoesNotExist:
                request.schedule = None
        else:
            request.schedule = None

        print(request.schedule)

        response = self.get_response(request)
        return response
