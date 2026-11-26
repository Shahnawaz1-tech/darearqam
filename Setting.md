# Project: Dar-e-Arqam Madrasa Management System

## Task: Build a Complete Dynamic System Settings & Configuration Module
Act as a Senior Laravel Architect, SaaS Product Designer, UI/UX Designer, and Full-Stack Developer.

I am developing a modern, multi-tenant Madrasa Management SaaS application named **Dar-e-Arqam**. I want you to analyze my existing project and implement a complete, professional, dynamic Settings & Configuration Module.

The objective is to allow authorized administrators to manage the entire application's branding, appearance, language, localization, academic configurations, and other system settings without modifying source code.

IMPORTANT:

- First analyze the existing project structure, database, authentication, authorization, frontend, and multi-tenancy architecture.
- Do not break any existing functionality.
- Follow the existing coding standards and architecture.
- Reuse existing components wherever possible.
- Implement actual backend functionality, not just static UI.
- Every setting must be stored persistently in the database.
- Respect tenant isolation throughout the application.

# 1. Settings Dashboard
Create a modern Settings dashboard with the following categories:

1. General Settings
2. Organization / Madrasa Profile
3. Branding & Logo Settings
4. Appearance & Theme Settings
5. Language & Localization
6. Academic Settings
7. Student Settings
8. Teacher Settings
9. Attendance Settings
10. Fee & Financial Settings
11. Examination Settings
12. Notification Settings
13. Email & SMS Settings
14. User & Role Settings
15. Security Settings
16. Backup & Data Management
17. Integration Settings
18. Subscription & Billing Settings
19. System Maintenance Settings
Use a modern sidebar or settings navigation layout with search functionality.

Each category should have its own dedicated settings page.

# 2. General Settings
Allow administrators to configure:

- Application Name
- Application Short Name
- Organization Name
- Madrasa Name
- Website URL
- Contact Email
- Phone Number
- Alternative Phone Number
- Address
- Country
- State / Province
- City
- Postal Code
- Timezone
- Date Format
- Time Format
- Currency
- Currency Symbol
- Financial Year Start
- Default Dashboard
- Default Pagination
- Footer Text
All fields should support Create, Read, Update, and Delete where appropriate.

# 3. Branding & Logo Settings
Create a complete branding management system.

Allow administrators to:

- Upload Main Application Logo
- Upload Alternative Logo
- Upload Dark Mode Logo
- Upload Light Mode Logo
- Upload Favicon
- Upload Login Page Logo
- Upload Dashboard Logo
- Upload Organization Seal
- Upload Login Background Image
Requirements:

- Image preview before saving.
- Replace existing images.
- Remove uploaded images.
- Validate file type and size.
- Store files securely.
- Automatically update logos across the application.
- Support responsive logo dimensions.
- Maintain separate branding for every tenant.

# 4. Appearance & Theme Settings
Create a dynamic theme customization panel.

Allow administrators to configure:

## Color Configuration

- Primary Color
- Secondary Color
- Accent Color
- Sidebar Background
- Sidebar Text Color
- Header Background
- Header Text Color
- Main Background
- Card Background
- Border Color
- Button Color
- Button Hover Color
- Link Color
- Success Color
- Warning Color
- Danger Color
- Info Color
Provide a color picker for each option.

## Theme Modes

- Light Mode
- Dark Mode
- System Default

## Layout Settings

- Fixed Sidebar
- Collapsible Sidebar
- Compact Sidebar
- Fixed Header
- Full Width Layout
- Boxed Layout
- Sidebar Position
- Default Dashboard Layout
Requirements:

- Live preview before saving.
- Apply changes dynamically without page reload where possible.
- Save preferences in the database.
- Support tenant-specific themes.
- Maintain user-specific preferences when appropriate.
- Provide Reset to Default functionality.

# 5. Language & Localization Settings
Implement a complete multilingual system.

Initially support:

1. English
2. Urdu
Allow administrators to:

- Change default application language.
- Enable or disable available languages.
- Set default language for new users.
- Allow individual users to select their preferred language.
- Configure date formats.
- Configure number formats.
- Configure currency formats.
- Configure timezone.
- Configure RTL and LTR layouts.

## Language Direction
English:

- LTR layout.
- Left sidebar.
- English labels.
Urdu:

- RTL layout.
- Right sidebar.
- Urdu labels.
- Right-aligned forms and tables.
- Proper Urdu font support.
IMPORTANT:
When switching between English and Urdu, update the complete application interface, including:

- Sidebar
- Header
- Dashboard
- Forms
- Buttons
- Tables
- Notifications
- Validation messages
- Reports
- Modals
- Settings pages
Do not translate only the dashboard.

Use Laravel's localization system and organized translation files.

Example:

lang/en.json
lang/ur.json

Ensure that missing translations have a safe fallback to English.

# 6. Organization / Madrasa Profile Settings
Allow each tenant to manage its own madrasa information:

- Madrasa Name
- Madrasa Code
- Registration Number
- Established Date
- Logo
- Principal / Administrator Name
- Contact Information
- Address
- Branch Information
- Website
- Email
- Phone
- Social Media Links
Support multiple branches where the existing SaaS architecture permits it.

# 7. Academic Settings
Allow administrators to configure:

- Academic Year
- Academic Sessions
- Terms
- Semesters
- Class Types
- Class Levels
- Sections
- Subjects
- Departments
- Study Programs
- Hifz Programs
- Course Duration
- Class Timing
- Weekly Holidays
- Working Days
Provide CRUD functionality for configurable academic entities.

Do not allow deleting records that are already being used by students or other academic records without proper validation.

# 8. Student Settings
Configure:

- Student Admission Number Prefix
- Admission Number Format
- Automatic Admission Number Generation
- Student Statuses
- Gender Options
- Guardian Relationships
- Student Categories
- Student Document Types
- Admission Form Fields
- Required Documents
Allow adding, editing, enabling, disabling, and deleting configurable options safely.

# 9. Teacher & Staff Settings
Configure:

- Employee ID Prefix
- Employee ID Format
- Staff Designations
- Departments
- Employment Types
- Staff Statuses
- Qualification Types
- Document Types
- Leave Types

# 10. Attendance Settings
Configure:

- Attendance Methods
- Present Status
- Absent Status
- Late Status
- Leave Status
- Half Day Status
- Attendance Time
- Late Arrival Threshold
- Attendance Notifications
- Weekly Off Days
- Auto Attendance Rules

# 11. Fee & Financial Settings
Configure:

- Currency
- Currency Symbol
- Fee Categories
- Fee Types
- Payment Methods
- Payment Statuses
- Fee Frequency
- Late Fee Rules
- Discount Types
- Scholarship Types
- Receipt Number Prefix
- Invoice Number Prefix
- Payment Due Dates
- Tax Settings
Include safe validation for financial records.

# 12. Examination Settings
Configure:

- Examination Types
- Exam Categories
- Grading Systems
- Grade Scales
- Passing Percentage
- Total Marks
- Result Statuses
- Position Calculation Rules
- Report Card Templates
For Hifz programs, also support:

- Sabaq Types
- Sabaq Levels
- Manzil Categories
- Revision Categories
- Hifz Evaluation Criteria

# 13. Notification Settings
Configure:

- Email Notifications
- SMS Notifications
- In-App Notifications
- Admission Notifications
- Attendance Notifications
- Fee Reminder Notifications
- Examination Notifications
- Result Notifications
- Parent Notifications
Allow administrators to enable or disable each notification type.

# 14. Email & SMS Configuration
Provide configurable integrations for:

- SMTP Host
- SMTP Port
- SMTP Username
- SMTP Password
- Encryption
- Sender Name
- Sender Email
- SMS Provider
- SMS API Credentials
Requirements:

- Test SMTP connection.
- Test SMS integration.
- Securely encrypt sensitive credentials.
- Never expose passwords in API responses.
- Never store secrets in frontend source code.

# 15. User & Role Settings
Provide:

- Role Management
- Permission Management
- Custom Roles
- Role Assignment
- User Statuses
- Login Restrictions
- Session Timeout
- Password Policies
Use the existing authorization package or architecture if available.

Implement permission-based access to every settings category.

# 16. Security Settings
Configure:

- Password Minimum Length
- Password Complexity
- Two-Factor Authentication
- Login Attempt Limits
- Account Lockout Duration
- Session Lifetime
- Allowed File Types
- Maximum Upload Size
- IP Restrictions (if appropriate)
Never weaken existing security controls through tenant-level configuration.

# 17. Backup & Data Management
Provide:

- Database Backup
- Backup History
- Backup Download
- Backup Retention Policies
- Restore Workflow
- Data Export
- Data Import
- CSV / Excel Export
Require elevated permissions and confirmation for destructive operations.

Ensure tenant data cannot be exported or restored across unauthorized tenants.

# 18. Subscription & Billing Settings
For the SaaS platform, implement:

- Subscription Plan Information
- Current Plan
- Subscription Start Date
- Expiry Date
- Renewal Status
- Usage Limits
- Student Limits
- Staff Limits
- Branch Limits
- Storage Limits
- Upgrade / Downgrade Options
Only the SaaS Super Admin should manage platform-level subscription plans and billing rules.

Tenant administrators should only manage their own subscription information within permitted limits.

# 19. Settings CRUD Management
For all configurable settings, implement:

- Create
- View
- Update
- Delete
- Enable / Disable
- Search
- Filter
- Pagination
- Sorting
- Bulk Actions where appropriate
- Validation
- Confirmation Dialogs
- Success and Error Notifications
Use soft deletes for important configurable records where appropriate.

Protect settings that are already referenced by existing transactions and academic records.

# 20. Multi-Tenant Architecture
This is a SaaS application, so multi-tenancy is extremely important.

Implement strict separation between:

## Platform-Level Settings
Managed only by Super Admin:

- Global application defaults
- Available subscription plans
- Global language options
- Platform-wide integrations
- Platform maintenance
- Global security policies

## Tenant-Level Settings
Managed by authorized Madrasa Admin:

- Madrasa profile
- Madrasa logo
- Theme colors
- Academic configuration
- Student configuration
- Teacher configuration
- Fee configuration
- Examination configuration
- Notification preferences

## User-Level Preferences
Managed by individual users:

- Preferred language
- Theme preference
- Sidebar preference
- Dashboard layout
- Date display preference where allowed
Never allow one tenant to read, modify, or delete another tenant's settings.

Always enforce tenant scope on backend queries, not just frontend filtering.

# 21. Database Architecture
Analyze the current database before creating migrations.

Design suitable tables such as:

- system_settings
- tenant_settings
- user_preferences
- tenant_branding
- tenant_themes
- languages
- tenant_languages
- academic_years
- academic_terms
- student_categories
- staff_designations
- attendance_statuses
- fee_categories
- payment_methods
- grading_systems
- notification_preferences
- integration_settings
- audit_logs
These are proposed tables, not mandatory. Reuse existing tables and relationships wherever possible.

Requirements:

- Proper foreign keys.
- Tenant IDs.
- Unique constraints.
- Indexing.
- Created By / Updated By.
- Timestamps.
- Soft deletes where appropriate.
- Secure storage of sensitive configuration.
Avoid creating unnecessary duplicate tables.

# 22. Settings UI / UX Design
Build a professional, modern SaaS dashboard.

Design requirements:

- Clean and attractive interface.
- Responsive layout.
- Modern cards.
- Organized settings navigation.
- Search settings.
- Save Changes button.
- Cancel Changes button.
- Reset to Default button.
- Live theme preview.
- Loading states.
- Empty states.
- Confirmation dialogs.
- Toast notifications.
- Form validation messages.
- Mobile-friendly layout.
Use the existing frontend technology and design system.

Avoid unnecessarily changing the existing dashboard layout.

# 23. Technical Implementation
For every settings category:

1. Analyze existing implementation.
2. Design database structure.
3. Create migrations if necessary.
4. Create models and relationships.
5. Implement controllers or service classes.
6. Create validation requests.
7. Implement authorization policies.
8. Create API endpoints or web routes.
9. Implement frontend components.
10. Connect frontend to backend.
11. Add loading and error states.
12. Test CRUD operations.
13. Test tenant isolation.
14. Test permissions.
15. Test persistence after logout/login.
16. Document the implementation.
Use service classes or repositories where appropriate.

Avoid putting all settings logic inside one large controller.

# 24. Audit Logs
Track important settings changes:

- Setting Name
- Previous Value
- New Value
- Changed By
- Tenant ID
- Date and Time
- IP Address where appropriate
Do not log plaintext passwords, API secrets, or other sensitive credentials.

# 25. Testing & Quality Assurance
Test:

- Creating settings.
- Updating settings.
- Deleting settings.
- Enabling/disabling options.
- Logo uploads.
- Theme changes.
- Language switching.
- Urdu RTL layout.
- English LTR layout.
- Tenant isolation.
- User permissions.
- API validation.
- Mobile responsiveness.
- Database persistence.
- Security and unauthorized access.

# 26. Development Workflow
Work in the following phases:

Phase 1: Analyze existing project architecture.

Phase 2: Prepare settings module architecture and database design.

Phase 3: Implement General Settings and Madrasa Profile.

Phase 4: Implement Branding and Logo Management.

Phase 5: Implement Theme Customization.

Phase 6: Implement English / Urdu Localization and RTL/LTR.

Phase 7: Implement Academic and Madrasa Configurations.

Phase 8: Implement Student, Teacher, Attendance, Fee and Examination Settings.

Phase 9: Implement Notifications and Integrations.

Phase 10: Implement User, Role and Security Settings.

Phase 11: Implement SaaS Subscription and Platform Settings.

Phase 12: Implement Audit Logs and Backup Management.

Phase 13: Perform complete testing and optimization.

After each phase:

- Explain what has been implemented.
- List modified and newly created files.
- Explain database changes.
- Identify any required environment variables.
- Run relevant tests.
- Report remaining tasks.
Do not implement everything in one uncontrolled operation.

# FINAL REQUIREMENT
I want a production-ready, scalable, secure, and maintainable Settings Management Module.

The settings must be dynamic and database-driven.

If an administrator changes the madrasa name, logo, colors, language, or other configurations, the changes should automatically reflect throughout the application wherever applicable.

Most importantly, maintain strict SaaS multi-tenancy, role-based permissions, and backward compatibility with existing features.

Start by analyzing my existing project. Do not modify files until you have presented the implementation plan and identified potential conflicts with the current architecture.
