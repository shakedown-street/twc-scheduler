Target May 9-16

Other:

- Add ability to edit clients from time slot table
- Polish sub list
- basic scheduling of OT and speech
  - they're fine with this being very simple. All this needs to do is let you put in appointments that are not tied to a tech, and select whether it is OT or speech. It will show up differently on the schedule, and not at all on sheet 1.

Done:

- Allow manually setting the start and end time of an appointment
- Indicate that an appointment is in clinic on the schedule
- Indicate that an appointment is in clinic on sheet 1
- Allow manually setting the start and end time of an availability
- Create custom time input component that only allows 15 minute intervals between a min and max value
- Add ability to to set "in clinic" for client availability
- Add warning about creating split blocks for techs or clients
- Add confirmation when deleting an availability
- Add ability to edit appointments, including recalculating warnings
- Add confirmation when deleting an appointment
- Add "is_onboarding" field to client that is set when creating/updating a client
- When a client is marked as "is_onboarding", their appointments are displayed as yellow instead of green on sheet 1
- Support creating "repeated" appointments
- When creating or editing an appointment, allow "overriding" and selecting a tech that is not recommended, show warnings
- Add hover card on schedule and sheet one to see appointment details
- Add legend to sheet one tables
- Add sheet one matrix showing how many times a client is scheduled with each tech, and the total number of techs they're scheduled with
- Allow setting both a background and text color for techs
- Added loading spinners to all pages
- Indicate on the availability blocks if they the availability is not the full block
- Default appointment form to in clinic if availability is in clinic, and show a warning whenever switching in clinic toggle
- Highlight the current page on the nav bar
- Polish sheet 1 pages
- Polish availability pages
- Only allow superusers to be able to create/update/delete anything, regular users only have readonly accessn c
- Show client/technician name when create/editing an availability
- Show client name when creating/editing an appointment
- Show day of the week when creating/editing an availability or appointment
- Indicate on client availability blocks if the client is available in clinic
- Add max_hours_per_day field to tech, add warning when creating an appointment would exceed this
- Refetch clients/techs after creating/updating/deleting an availability to refresh backend calculated fields
- Allow updating/deleting technicians from overview pages
- Disabled signup, email verification, and password reset
- Add technicians table on schedule page, showing their hours and blocks for the day
- Show sub availability as blue on technicians overview
- Make technician day overview a drawer instead of always visible on the schedule
- Add readonly client notes on appointment hover and appointment form
- Add table on the sublist showing all current and past technicians for each client
- Add a way to select past technicians for a client
- Add "sub_notes" field to client to enable indicating who can't sub for a client
- Add sub notes to the client form and display on the sub list
- Add ability to edit clients from the ClientTechnicianHistory table
- Show rating, spanish speaking, day hours, week hours, and prescribed hours on schedule table
