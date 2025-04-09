Target June 19th

Requested by Alycen and Amy:

- add a read only role
  - BCBAs can see the full schedule but not edit it
- warning about max hours per day for techs
  - set max hours per day when adding/updating a tech
- basic scheduling of OT and speech
  - they're fine with this being very simple. All this needs to do is let you put in appointments that are not tied to a tech, and select
    whether it is OT or speech. It will show up differently on the schedule, and not at all on sheet 1.
- sub list
  - when setting a tech's availability, you need to be able to indicate if this is a regular availability, or available for sub
  - new page to see all subs
  - on sheet one, show sub availability as solid blue
- additional table on the schedule page:
  - tech name | blocks for the day | total hours | requested hours

Other:

- Need to indicate on the availability blocks if the appointment is in clinic, and if it is not the full block
- Display warning if client is not available for in clinic and it is checked
  - should default to in clinic as well if the client is available in clinic
- How can we optimize the load times further? What sort of caching can we do?
- Add loading spinners

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
