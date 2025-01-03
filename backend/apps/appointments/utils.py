from datetime import datetime


def get_difference_in_minutes(start_time, end_time):
    start_datetime = datetime.combine(datetime.today(), start_time)
    end_datetime = datetime.combine(datetime.today(), end_time)

    time_difference = end_datetime - start_datetime

    total_minutes = time_difference.total_seconds() / 60
    return total_minutes
