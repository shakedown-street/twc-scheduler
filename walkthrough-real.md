Client availability:

- Added currently onboarding field
- Clicking a block now shows a form where you can manually set the time, and whether or not they're available in clinic
- Can filter by "in clinic"
- Show indicator when an availability is in clinic, or is not the full block
- Add ability to edit availability
- Show confirmation dialog when deleting an availability
- General polishing

Technician availability:

- All the same bells and whistles as client availability
- Can filter by "sub only"
- Add max hours per day field
- Allow setting a font color and show a preview
- Add indicator when an availability is sub only

Schedule:

- Technician's table to the right of the schedule. Question, does this need to always be visible, or could it be in a drawer?
- Added a hover card when hovering over an appointment that shows basic details
- Show recommended subs on hover card if available
- Can manually set the time
- Indicate when an appointment is in clinic
- Can edit appointments and add notes
- Can override techs
- Show full range of scheduling conflicts, including split blocks
- Support creating "repeated" appointments, this has some quirks
- Add ability to edit appointments
- Show confirmation dialog when deleting an appointment
- Default to in_clinic status of client availability, show a warning if this is changed

Sheet 1 (overview):

- Hovering a block shows appointments like the schedule
- Add a legend
- When a client is marked as onboarding, show them as yellow instead of green
- Add ability to edit clients and technicians from the overview
- Add the matrix component

Sub list:

- Show sub availability
- Need to add the other tables still

Other:

- Disabled signup, email verification and password reset
- Added loading states to all pages
- Highlight the current page in the navbar
- Only allow superusers to be able to create/update/delete anything, regular users only have readonly access
