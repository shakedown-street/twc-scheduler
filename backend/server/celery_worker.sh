#!/bin/bash

sleep 3 # avoid database being unavailable

(
    # Running with -B, so the beat scheduler runs also
    celery -A schedule_builder worker -B -l info
) || exit 1
