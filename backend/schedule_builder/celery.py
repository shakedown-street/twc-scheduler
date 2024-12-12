from celery import Celery
from celery.schedules import crontab
from django.conf import settings

# Ensure 'DJANGO_SETTINGS_MODULE' is set in environment

app = Celery("schedule_builder")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks(settings.INSTALLED_APPS)

# Schedule tasks here
app.conf.beat_schedule = {
#    "Task Description": {
#        "task": "apps.name.tasks.task_name",
#        "args": ("arg1", "arg2"),
#        "schedule": crontab(
#            hour="*/12",
#            minute=0,
#        ),
#    },
}
