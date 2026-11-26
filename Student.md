# Project: Dar-e-Arqam Madrasa Management SaaS
# Task: Complete Dynamic Student Management System + Functional Student Dashboard + Functional Admin Dashboard

Act as a Senior Laravel Developer, SaaS Architect, Database Designer, and Professional UI/UX Engineer.

I am developing a multi-tenant Madrasa Management SaaS application called Dar-e-Arqam.

I want you to transform my existing Student Management Module into a fully dynamic, production-ready student management system.

Additionally, I want both the Admin Dashboard and Student Dashboard to be completely functional and connected to real database records.

IMPORTANT:
First analyze my existing project architecture, database, routes, controllers, models, frontend components, authentication, permissions, and multi-tenancy implementation.

Do not create duplicate functionality.
Do not break existing features.
Do not use dummy or hardcoded dashboard statistics.
Do not create static buttons that do nothing.
Every feature must work with actual backend functionality.

==================================================
PHASE 1: STUDENT MANAGEMENT MODULE
==================================================

1. Student Registration & Admission

Create a complete student admission system.

Student information should include:

Personal Information:
- Student ID
- Admission Number (auto-generated)
- First Name
- Last Name
- Full Name
- Profile Photo
- Gender
- Date of Birth
- Age (calculated automatically)
- Blood Group (optional)
- Nationality
- Religion (only if required by the institution)
- Student Phone Number
- Email Address
- Residential Address
- City
- Province
- Country

Guardian Information:
- Father Name
- Father Phone
- Mother Name
- Guardian Name
- Guardian Relationship
- Guardian Phone
- Guardian Email
- Guardian Address
- Emergency Contact

Academic Information:
- Academic Year
- Admission Date
- Class
- Section
- Department
- Study Program
- Enrollment Type
- Previous School/Madrasa
- Previous Class
- Assigned Teacher
- Student Status

Madrasa-Specific Information:
- Hifz Program Enrollment
- Nazra Program Enrollment
- Hifz Start Date
- Quran Learning Level
- Assigned Hifz Teacher
- Previous Hifz Progress (if applicable)

Documents:
- Birth Certificate
- B-Form
- Previous School Certificate
- Student Photograph
- Other Required Documents

Implement proper form validation and file upload functionality.

2. Student CRUD

Implement:

- Add Student
- View Student
- Edit Student
- Update Student
- Delete Student
- Restore Student (if soft deletes are used)
- Student Profile
- Student Details
- Student Search
- Advanced Filters
- Pagination
- Sorting
- Bulk Actions
- Student Import
- Student Export

Add filters for:

- Admission Number
- Student Name
- Class
- Section
- Academic Year
- Gender
- Admission Date
- Student Status
- Hifz Program

Use server-side filtering and pagination.

3. Student Profile Page

Create a complete student profile with organized tabs:

- Overview
- Personal Information
- Guardian Information
- Academic Information
- Attendance
- Fee Records
- Examination Results
- Hifz Progress
- Assignments
- Documents
- Notifications
- Activity History

Every tab should display actual data from the database.

4. Student Status Management

Support:

- Active
- Pending Admission
- Inactive
- Suspended
- Transferred
- Graduated
- Withdrawn

Allow authorized administrators to update student status.

Record status history, including previous status, new status, reason, changed by, and date.

==================================================
PHASE 2: STUDENT ACADEMIC MANAGEMENT
==================================================

Implement complete student academic functionality.

Features:

- Student Class Assignment
- Section Assignment
- Subject Assignment
- Teacher Assignment
- Academic Year Assignment
- Class Promotion
- Student Transfer
- Student Re-Admission
- Academic History

Class Promotion:

Allow administrators to promote students individually or in bulk.

Before promotion:
- Verify academic year.
- Check promotion eligibility.
- Check examination results.
- Show students' current and next classes.
- Allow authorized manual adjustments.

After promotion:
- Update enrollment records.
- Preserve previous academic history.
- Generate the new academic enrollment record.
- Prevent duplicate enrollments.

Never overwrite historical academic records.

==================================================
PHASE 3: STUDENT ATTENDANCE
==================================================

Integrate attendance directly into the student profile.

Features:

- Daily Attendance
- Monthly Attendance
- Attendance History
- Present
- Absent
- Late
- Leave
- Half Day

Show:

- Total Working Days
- Present Days
- Absent Days
- Leave Days
- Attendance Percentage

Admin should be able to:

- Mark Attendance
- Edit Attendance (with permission)
- View Class Attendance
- View Individual Student Attendance
- Generate Attendance Reports

Prevent duplicate attendance entries for the same student, date, and relevant attendance session.

==================================================
PHASE 4: STUDENT FEE MANAGEMENT
==================================================

Integrate fee records into student profiles.

Features:

- Student Fee Structure
- Monthly Fees
- Admission Fees
- Examination Fees
- Other Charges
- Discounts
- Scholarships
- Late Fees
- Payment History
- Outstanding Balance
- Fee Receipts

Admin functionality:

- Generate Student Fee Invoice
- Record Payment
- Edit Payment with appropriate permissions
- Generate Receipt
- View Outstanding Fees
- Apply Authorized Discounts
- Generate Fee Reports

Display actual fee information in the student dashboard.

Financial transactions must not be permanently deleted through ordinary CRUD operations. Use appropriate reversal and audit mechanisms.

==================================================
PHASE 5: EXAMINATION & RESULTS
==================================================

Integrate examination records with students.

Features:

- Examination Schedule
- Subject Marks
- Total Marks
- Obtained Marks
- Percentage
- Grades
- Pass / Fail
- Position
- Result History
- Report Cards

Student dashboard should display:

- Latest Examination Result
- Subject-wise Marks
- Overall Percentage
- Previous Results
- Downloadable Report Card

Ensure students can only access their own results.

==================================================
PHASE 6: HIFZ & QURAN PROGRESS
==================================================

This is a Madrasa Management System, so implement specialized Quran learning functionality.

Features:

- Hifz Progress
- Daily Sabaq
- Sabaq Para
- Sabaq Revision
- Sabqi
- Manzil
- Surah
- Ayat Range
- Teacher Remarks
- Daily Evaluation
- Memorization Quality
- Revision History

Admin/Teacher should be able to record daily progress.

Student dashboard should display:

- Total Completed Paras
- Current Para
- Current Surah
- Daily Sabaq
- Revision Progress
- Teacher Remarks
- Monthly Progress Chart

Do not assume all students are enrolled in Hifz. Support different learning programs.

==================================================
PHASE 7: STUDENT DASHBOARD
==================================================

Build a modern, responsive and fully functional Student Dashboard.

Dashboard should show only the authenticated student's own data.

Dashboard widgets:

1. Welcome Message
2. Student Profile Card
3. Admission Number
4. Current Class
5. Academic Year
6. Attendance Percentage
7. Fee Balance
8. Upcoming Exams
9. Latest Examination Results
10. Hifz Progress (if enrolled)
11. Recent Notifications
12. Upcoming Events
13. Recent Activities

Dashboard sections:

A. Academic Overview

- Current Class
- Subjects
- Assigned Teachers
- Academic Performance
- Examination Results

B. Attendance Overview

- Monthly Attendance Chart
- Attendance Percentage
- Recent Attendance Records
- Absence History

C. Fee Overview

- Total Fees
- Paid Amount
- Outstanding Amount
- Upcoming Due Dates
- Payment History

D. Hifz Overview

- Current Sabaq
- Completed Paras
- Revision Progress
- Teacher Remarks

E. Notifications

- Fee Reminders
- Examination Announcements
- Attendance Alerts
- General Announcements

F. Quick Actions

- View Profile
- View Attendance
- View Results
- View Fee History
- Download Report Card
- View Notifications

Every dashboard card, link, and button must navigate to a real functional page or perform a real action.

Hide modules that are not applicable to the student's enrolled program.

==================================================
PHASE 8: ADMIN DASHBOARD
==================================================

Transform the existing Admin Dashboard into a fully functional management dashboard.

All statistics must come from actual database records.

Dashboard Statistics:

- Total Students
- Active Students
- New Admissions
- Pending Admissions
- Inactive Students
- Total Teachers
- Total Classes
- Total Sections
- Total Branches
- Today's Attendance
- Attendance Percentage
- Total Fee Collection
- Outstanding Fees
- Upcoming Examinations

Charts:

1. Student Admission Trends
2. Monthly Attendance Trends
3. Fee Collection Trends
4. Class-wise Student Distribution
5. Gender Distribution
6. Student Status Distribution
7. Examination Performance

Dashboard Tables:

- Recent Admissions
- Today's Absent Students
- Recent Fee Payments
- Upcoming Examinations
- Recent Student Activities
- Pending Admission Requests

Quick Actions:

- Add Student
- Manage Students
- Add Teacher
- Mark Attendance
- Create Examination
- Generate Fee Invoice
- Record Payment
- View Reports

Every card should be clickable and open the relevant filtered management page.

Dashboard filters:

- Academic Year
- Branch
- Class
- Section
- Date Range

Make sure dashboard statistics respect the selected filters.

==================================================
PHASE 9: ADMIN STUDENT MANAGEMENT
==================================================

Create a complete Admin Student Management interface.

Admin should be able to:

- View All Students
- Add New Students
- Edit Student Information
- Delete or Archive Students
- View Student Profiles
- Change Student Status
- Assign Class
- Assign Section
- Assign Teachers
- Promote Students
- Transfer Students
- Manage Documents
- Manage Attendance
- Manage Fees
- Manage Results
- Manage Hifz Progress

Add advanced search and filtering.

Use server-side pagination and optimized database queries.

==================================================
PHASE 10: ROLE-BASED ACCESS CONTROL
==================================================

Implement permissions for:

Super Admin:
- Manage all tenants.
- Manage platform-level student limits.
- Access authorized platform-level analytics.

Madrasa Admin:
- Manage students within their own tenant.
- Access their madrasa dashboard.
- Manage admissions and student records.

Branch Admin:
- Manage students within assigned branches.

Teacher:
- View assigned students.
- Mark attendance.
- Add academic remarks.
- Update Hifz progress when authorized.

Accountant:
- Access fee-related student information.
- Record payments.
- Generate receipts.

Student:
- View only their own profile.
- View their own attendance.
- View their own fees.
- View their own examination results.
- View their own Hifz progress.

Parent/Guardian:
- View only linked children.
- Access permitted academic and fee information.

Enforce all permissions on the backend.

Never rely only on hiding frontend buttons.

==================================================
PHASE 11: DATABASE & BACKEND ARCHITECTURE
==================================================

Analyze the current database before making changes.

Review existing tables and relationships.

Use or adapt appropriate structures such as:

- students
- student_guardians
- student_documents
- student_enrollments
- student_status_histories
- student_attendance
- student_fee_assignments
- student_fee_invoices
- student_fee_payments
- student_examination_results
- student_hifz_progress
- student_activity_logs
- student_notifications

These are suggested structures, not mandatory. Reuse existing database architecture wherever appropriate.

Requirements:

- Correct foreign keys.
- Tenant ID isolation.
- Branch ID where appropriate.
- Database indexes.
- Unique admission numbers within the appropriate scope.
- Soft deletes where appropriate.
- Created By / Updated By.
- Proper model relationships.
- Database transactions for critical operations.

Preserve historical records.

==================================================
PHASE 12: MULTI-TENANT SECURITY
==================================================

This is a SaaS application.

Ensure:

- Every student belongs to the correct tenant.
- Every enrollment belongs to the correct tenant.
- Every student record is tenant-scoped.
- Branch access is restricted.
- Student dashboard uses authenticated student identity.
- Students cannot modify their own financial or academic records.
- Teachers can only access assigned students.
- Parents can only access linked children.

Validate tenant ownership on every relevant backend request.

Never trust tenant_id, student_id, or user_id supplied directly by the frontend without authorization checks.

==================================================
PHASE 13: FRONTEND UI/UX
==================================================

Use the existing frontend technology and design system.

Create:

- Modern responsive dashboard.
- Professional statistics cards.
- Interactive charts.
- Clean student profile pages.
- Advanced searchable tables.
- Reusable forms.
- Modal dialogs.
- Confirmation dialogs.
- Toast notifications.
- Loading skeletons.
- Empty states.
- Error states.
- Mobile responsive layouts.

Support English and Urdu.

When Urdu is selected, support complete RTL layout.

Follow existing branding, logo, and dynamic theme settings.

==================================================
PHASE 14: TESTING
==================================================

Implement and test:

- Student CRUD.
- Admission number generation.
- Document upload.
- Student enrollment.
- Class promotion.
- Attendance management.
- Fee management.
- Examination results.
- Hifz progress.
- Student dashboard data.
- Admin dashboard statistics.
- Search and filters.
- Pagination.
- Role-based access.
- Tenant isolation.
- Branch restrictions.
- English / Urdu.
- RTL / LTR.
- Mobile responsiveness.

Use Laravel feature tests and unit tests where appropriate.

==================================================
PHASE 15: IMPLEMENTATION WORKFLOW
==================================================

Do not implement all features in one uncontrolled operation.

Follow these phases:

Phase 1: Existing Project Analysis.

Phase 2: Student Database and Architecture.

Phase 3: Student Admission and CRUD.

Phase 4: Student Profile and Documents.

Phase 5: Academic Enrollment and Promotion.

Phase 6: Attendance Integration.

Phase 7: Fee Integration.

Phase 8: Examination Integration.

Phase 9: Hifz Progress Integration.

Phase 10: Student Dashboard.

Phase 11: Admin Dashboard.

Phase 12: Role-Based Permissions.

Phase 13: Multi-Tenant Security.

Phase 14: UI/UX Optimization.

Phase 15: Testing and Production Readiness.

After each phase:

- Explain completed functionality.
- List all modified files.
- List newly created files.
- Explain database migrations.
- Explain API endpoints.
- Run relevant tests.
- Report unresolved issues.
- Wait for approval before proceeding to the next major phase.

# FINAL EXPECTATION

I need a production-ready Student Management System, not a demo.

The Student Dashboard must display real data belonging to the authenticated student.

The Admin Dashboard must display accurate, database-driven information and allow administrators to manage students and related operations.

Every button, chart, filter, form, card, and action must work properly.

Preserve the existing application architecture, multi-tenancy, branding, and functionality.

Start by analyzing the existing project and presenting a detailed implementation plan before changing any files.
