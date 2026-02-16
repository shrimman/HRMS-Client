
# HRMS Internship Assignment - Detailed Requirements Document 
## 1. Overview and Roles 
The application is an internal HRMS focused on travel, expenses, social engagement, pool-table scheduling, org chart, and referral workflows. Interns should design database schema, APIs, and basic UI flows to support all modules.
### User Roles
#### Employee
- View assigned travels
- Submit expenses
- See social posts
- Schedule and book pool table
- View social achievements feed
- Browse job listings and refer friends
#### Manager
- View team members and their details
- View team members' achievements
- Approve/reject travel and expenses for direct reports
- Access org chart
- Browse jobs
- Refer candidates
#### HR
- Create and manage travels
- Manage documents
- Verify/approve expenses
- Configure job postings and recipients
- View org chart for all employees

**Note:** Role-based access control must ensure only allowed actions are visible and executable per role.
---
## 2. Travel & Expense Module
### 2.1 Travel Assignment by HR
- HR can create a Travel Plan for one or more employees
- When HR saves a travel:
    - System sends an email notification to each selected employee with travel details
    - Notification should also appear in the in-app notification center
### 2.2 Travel-Related Documents
- System must support a document library per travel and per employee:
    - Documents provided by HR (e.g., tickets, visa letters, policy PDFs)
    - Documents uploaded by employee (e.g., visa scans, boarding passes)
- Each document record includes:
    - Owner type (HR / Employee), uploaded by, document type, file name, uploaded date, associated travel ID, and employee ID
- Permissions:
    - HR: Upload/view all travel documents
    - Employee: Upload/view only documents tied to their own travel
    - Manager: View documents of team members' travel (read-only)
### 2.3 Expense Submission Window
- An Expense must always be linked to a Travel Plan
- Employee can add expenses only after trip start date and no later than 10 days after trip end date:
    - System should enforce this rule and block late submissions with a proper error message
    - System should allow multiple expenses per trip and show total claimed amount for each travel
### 2.4 Proof Upload and Verification
- Every expense must include at least one proof document (receipt image/PDF)
- System should not allow submission without proof
- HR can:
    - View list of expenses with filters (by employee, status, date range, travel)
    - Open expense details with proof preview
    - Change status to Approved or Rejected and optionally add remarks
- When employee submits an expense (changing status from Draft to Submitted):
    - System sends an email notification to HR or a configured HR expense mailbox
### 2.5 Approval and Status Tracking
- HR actions:
    - Approve: Status becomes Approved, timestamp and actor stored
    - Reject: Status becomes Rejected with mandatory remark
- Employee view:
    - Should see list of expenses with status and HR remarks
- Additional requirement:
    - Add simple validation rules (e.g., max per-day amount, required category) configurable at database or code level
---
## 3. Social Achievements & Celebrations
### 3.1 Achievements Feed
- There should be a dedicated Achievements tab behaving like an internal social feed
- Employees can create Achievement Posts:
    - Fields: Post ID, author, title, description, tags, created date, visibility (default: all employees)
- All users (Employee, Manager, HR) can:
    - View posts in reverse chronological order
    - Like a post (one like per user per post)
    - Comment on a post:
        - Comment ID, post ID, author, text, created date
### 3.2 Engagement Behavior
- Each post shows:
    - Like count, list of recent likers (optional), comment count, and comment list
- Employees can edit or delete their own posts and comments; HR may delete any inappropriate content
- If HR deletes any inappropriate content, warning mail should be sent to concerned person
- Additional stretch:
    - Add simple search or filters on achievements by author, tag, date range
### 3.3 Birthdays and Work Anniversaries
- System maintains employee profile with:
    - Date of birth, date of joining, manager, department, role
- On the Achievements feed (or a dedicated Celebrations section):
    - On an employee's birthday: auto-create a system post like "Today is X's birthday"
    - On work anniversary: post "X completes Y years at the organization"
- Auto posts:
    - Are visible to all users and support likes and comments
    - Must be clearly marked as system-generated posts
---
## 4. Games Scheduling
### 4.1 Context and Constraints
- Organization has foosball, chess, and pool table; all games should be managed in this module
- Objective:
    - Schedule time slots for pool such that each interested player gets one slot before any player gets a second slot (fair rotation)
    - Interns should implement a fair scheduling algorithm (e.g., queue-based round-robin)
### 4.2 Slot Configuration
- HR or Admin can configure:
    - Pool table operating hours (24 Hrs)
    - Slot duration (e.g., 30 minutes)
    - Max players per slot (e.g., 2 or 4)
    - System generates available slots per day based on configuration
- Users should configure interest in user profile for game, and interested players should only be considered in booking slots
### 4.3 Booking Rules
- Any employee can request a Pool Slot
- Employee can book any game with max 3 other employees; all should get mail of booking and calendar should also be booked as private event for all of them
- Fairness rule:
    - Maintain a queue of players waiting to play
    - When allocating slots, always pick employees with fewest completed slots in the current cycle before giving extra slots to the same people
- Additional constraints:
    - One active booking per employee per day
    - Allow cancellation; when someone cancels, next eligible person from waiting queue is assigned
- Additional stretch:
    - Simple dashboard showing upcoming slots and player names
---
## 5. Organization Chart
### 5.1 Data Model
- The organization chart screen allows users to search or click to select an employee
### 5.2 Hierarchy View
When an employee is selected:
- Show top-level managerial chain:
    - Starting from selected employee's manager up to the topmost manager (CEO, etc.)
    - Represent as a vertical tree or breadcrumb (e.g., CEO → VP → Manager → Selected Employee)
- Show one level of direct reports:
    - All employees whose manager ID is the selected employee
- Basic UX expectations:
    - Each node shows name, designation, and photo/avatar if available
    - Clicking any node reloads the view for that employee (new chain + their direct reports)
---
## 6. Job Listing, Sharing & Referral
### 6.1 Job Listing Screen
- Screen lists active Job Openings
- For each job card:
    - Show details plus two buttons: **Share Job** and **Refer Friend**
### 6.2 Share Job via Email
- On clicking Share Job:
    - Open a modal asking for recipient email address (one or multiple)
    - Basic validation on email format
- On submit:
    - Send an email to the provided address containing:
        - Job title and summary in email body
        - JD attached as PDF or document from stored file path
    - Optionally store a record: SharedBy, Email, DateTime, Job ID
### 6.3 Refer Friend Flow
- On clicking Refer Friend:
    - Open a modal with fields:
        - Friend name
        - Friend email (optional but recommended)
        - CV file upload
        - Short note (optional)
- On submit:
    - Create a Referral record
    - Send an email to:
        - HR contact for that job
        - Specific HR person (Anjum)
        - Configured CV reviewer(s) for the job (single or multiple emails)
    - Email body should contain:
        - Job title and ID
        - Referrer details (employee name and ID)
        - Friend's details
        - CV attached
### 6.4 Configurability and Logging
- HR should be able to:
    - Configure default HR email (e.g., hr.india@roimaint.com)
    - Set per-job HR owner and CV reviewer email(s)
- System should log:
    - Each referral, including recipients and status changes
    - Basic audit timestamps for when status moves from New to In Review, etc.
---
## 7. Non-Functional and Deliverables (for Interns)
### 7.1 Non-Functional Expectations
- **Authentication & Authorization:**
    - Simple login with role-based access checks on each action
- **Usability:**
    - Clean navigation with obvious entry points: Travel & Expenses, Achievements, Games Slots, Org Chart, Jobs
- **Validation:**
    - Proper server-side validation for date ranges, file types, and mandatory fields
### 7.2 Suggested Intern Deliverables
- ER diagram and overall data model covering all modules
- REST API design (endpoints, request/response structures) for: Travel, Expense, Achievements, Pool Slots, Employees, Jobs, Referrals
- Wireframes or basic UI screens for each major flow
- Explanation of scheduling logic for games slots