- Who are the users?

  - Requirement for patients to log in?
  - Only schedulers, everyone has the same access

- Main issue is finding what availabilities overlap and who can work with who
  - Availability can be entered ad-hoc for both the employee and the patient
  - Specific titles and certifications dictate who can work with who?
    - How can this be modeled?
  - Sessions cannot overlap
  - What other rules dictate who can match up with who?
  - Minimum/maximum hour warnings for patients/employees?
- HIPAA compliance?
  - How can we make it easier on ourselves to be HIPPA compliant?
- What similar software already exists? What is the issue with them that we're trying to solve?

Basic Minimum Viable Product:

- Scheduler is only user type, patient's and employees do not log in in this phase
- Only basic patient information is stored
- Ability to add patients
  - Set main availability
  - Add ad-hoc availabilities
  - Mark which titles/certifications are required to work with this patient
- Ability to add employees
  - Set main availability
  - Add ad-hoc availabilities
  - Add titles/certifications
- Calendar view
  - Clicking on a day prompts scheduler to select a patient, then enter a time
  - As entered time changes, show employees who could fill that time gap based on availability,
  - Select employee to create appointment and add to calendar
  - Able to edit or remove appointments
- In this phase, it'll be up to the scheduler to communicate with the patient and the employee
- Printable calendar view?

Technician

- name
- color
- spanish_speaking
- skill_level
- notes

Client

- name
- rating
- services?
- prescribed_hours?
