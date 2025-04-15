Availability:

- Show client/technician name when create/editing an availability
- Show day of the week when creating/editing an availability or appointment
- Allow manually setting the start and end time of an availability
- Create custom time input component that only allows 15 minute intervals between a min and max value
- Indicate on the availability blocks if they the availability is not the full block
- Add ability to to set "in clinic" for client availability
- Indicate on client availability blocks if the client is available in clinic
- Add confirmation when deleting an availability
- Add "is_onboarding" field to client that is set when creating/updating a client
- Allow setting both a background and text color for techs
- Add max_hours_per_day field to tech, add warning when creating an appointment would exceed this

Schedule:

- Show client name when creating/editing an appointment
- Show day of the week when creating/editing an availability or appointment
- Allow manually setting the start and end time of an appointment
- Support creating "repeated" appointments
- Indicate that an appointment is in clinic on the schedule
- Add ability to edit appointments, including recalculating warnings
- Add confirmation when deleting an appointment
- Add warning about creating split blocks for techs or clients
- When creating or editing an appointment, allow "overriding" and selecting a tech that is not recommended, show warnings
- Default appointment form to in clinic if availability is in clinic, and show a warning whenever switching in clinic toggle
- Add hover card on schedule and sheet one to see appointment details

Sheet 1:

- Add legend to sheet one tables
- Indicate that an appointment is in clinic on sheet 1
- When a client is marked as "is_onboarding", their appointments are displayed as yellow instead of green on sheet 1
- Add hover card on schedule and sheet one to see appointment details
- Add sheet one matrix showing how many times a client is scheduled with each tech, and the total number of techs they're scheduled with
- Allow updating/deleting technicians from overview pages

Other:

- Disabled signup, email verification, and password reset
- Added loading spinners to all pages
- Highlight the current page on the nav bar
- Polish sheet 1 pages
- Polish availability pages
- Refetch clients/techs after creating/updating/deleting an availability to refresh backend calculated fields
- Only allow superusers to be able to create/update/delete anything, regular users only have readonly access
