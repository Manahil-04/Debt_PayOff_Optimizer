---
title: Product Requirements Document
app: jolly-turtle-kick
created: 2025-12-16T13:45:48.705Z
version: 1
source: Deep Mode PRD Generation
---

# PRODUCT REQUIREMENTS DOCUMENT

**EXECUTIVE SUMMARY**

*   **Product Vision:** PathLight aims to empower individuals to understand and conquer their debt by providing clear insights, personalized payoff strategies, and dynamic guidance, ultimately leading to financial freedom.
*   **Core Purpose:** To solve the pain points of debt confusion, uncertainty about payoff strategies, and the inability to explore realistic options, by offering an instant debt snapshot, goal-aligned projections, and guided calibration.
*   **Target Users:** Individuals struggling to understand their total debt picture, unsure about the best payoff strategy, or wanting to explore realistic debt management scenarios.
*   **Key Features:**
    *   Manual Debt Entry (User-Generated Content)
    *   Personalized Payoff Projections (System-Generated Analysis)
    *   Interactive Visualizations (System-Generated Analysis)
    *   AI Auto-Summary & Explanations (System-Generated Analysis)
    *   Lightweight Data Calibration (User-Generated Content)
*   **Complexity Assessment:** Moderate
    *   **State Management:** Local (user-specific data)
    *   **External Integrations:** 0
    *   **Business Logic:** Moderate (debt calculation algorithms, dynamic UI logic)
    *   **Data Synchronization:** None
*   **MVP Success Metrics:**
    *   Users can successfully enter their debts and reach the first personalized payoff projection screen.
    *   The core debt entry, projection, and summary features work without errors.
    *   Users can complete the calibration step and see updated projections.

**1. USERS & PERSONAS**

*   **Primary Persona:** The Overwhelmed Debtor
    *   **Name:** Sarah, 32
    *   **Context:** Sarah has multiple debts (credit cards, student loans) and feels overwhelmed by the total amount and varying interest rates. She's tried online calculators but finds them confusing and rigid. She wants a clear, actionable plan.
    *   **Goals:** Understand her total debt, find the fastest or most cost-effective way to pay it off, and feel confident about her chosen strategy.
    *   **Needs:** A simple, intuitive interface; clear explanations; personalized recommendations; the ability to easily input and adjust her debt information.

**2. FUNCTIONAL REQUIREMENTS**

*   **2.1 User-Requested Features (All are Priority 0)**

    *   **FR-001: User Authentication & Profile Management**
        *   **Description:** Users can securely register for an account, log in, manage their profile information, and reset their password. This ensures personalized data storage and access.
        *   **Entity Type:** Configuration/System
        *   **User Benefit:** Protects personal financial data and allows for a personalized, persistent experience.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **Create:** Register new account with email and password.
            *   **View:** Access and view personal profile details.
            *   **Edit:** Update name, email, password.
            *   **Delete:** Initiate account deletion (with confirmation).
            *   **Additional:** Password reset functionality.
        *   **Acceptance Criteria:**
            *   - [ ] Given valid credentials, when a user logs in, then they are granted access to their dashboard.
            *   - [ ] Given invalid credentials, when a user attempts to log in, then an error message is displayed.
            *   - [ ] Users can successfully register a new account.
            *   - [ ] Users can reset their password via email.
            *   - [ ] Users can update their profile information (e.g., name, email).
            *   - [ ] Users can initiate account deletion, which removes their data after confirmation.

    *   **FR-002: Manual Debt Entry**
        *   **Description:** Users can manually input details for each of their debts, including debt type, current balance, Annual Percentage Rate (APR), and minimum monthly payment.
        *   **Entity Type:** User-Generated Content
        *   **User Benefit:** Allows users to accurately represent their financial situation in the application.
        *   **Primary User:** The Overwhelmed Debtor
        *   **Lifecycle Operations:**
            *   **Create:** Users can add new debt entries via a form.
            *   **View:** Users can see a list of their entered debts and their details.
            *   **Edit:** Users can modify any field of an existing debt entry.
            *   **Delete:** Users can remove a debt entry.
            *   **List/Search:** Users can view all their debts in a list.
        *   **Acceptance Criteria:**
            *   - [ ] Given a form, when a user enters valid debt type, balance, APR, and minimum payment, then a new debt is created and saved.
            *   - [ ] Given a list of debts, when a user selects a debt, then its details are displayed.
            *   - [ ] Given an existing debt, when a user modifies its details and saves, then the debt is updated.
            *   - [ ] Given an existing debt, when a user chooses to delete it and confirms, then the debt is removed from their list.
            *   - [ ] Users can view a list of all their entered debts.

    *   **FR-003: Goal Setting**
        *   **Description:** Users can select a primary goal for their debt payoff strategy (e.g., "Pay off debt faster," "Reduce monthly payment," "Lower interest"). This goal will drive projections and CTAs.
        *   **Entity Type:** User-Generated Content
        *   **User Benefit:** Personalizes the debt strategy to align with their financial priorities.
        *   **Primary User:** The Overwhelmed Debtor
        *   **Lifecycle Operations:**
            *   **Create:** Users select their initial goal.
            *   **View:** Users can see their currently selected goal.
            *   **Edit:** Users can change their goal at any time.
        *   **Acceptance Criteria:**
            *   - [ ] Given a selection of goals, when a user chooses one, then it is saved as their primary goal.
            *   - [ ] Given a primary goal is set, when the user views their dashboard, then the goal is clearly displayed.
            *   - [ ] Given a primary goal is set, when the user selects a different goal, then the new goal replaces the old one.

    *   **FR-004: Payoff Projection & Analysis**
        *   **Description:** The system computes and displays the user's current debt payoff trajectory, an optimized payoff path (Snowball or Avalanche method, chosen based on the user's goal), and highlights interest savings and months saved. It provides transparent breakdowns of timelines, interest, and monthly impact for both scenarios.
        *   **Entity Type:** System-Generated Analysis
        *   **User Benefit:** Provides immediate clarity on their debt situation and shows the potential benefits of an optimized strategy.
        *   **Primary User:** The Overwhelmed Debtor
        *   **Lifecycle Operations:**
            *   **Create:** Projections are generated automatically upon debt entry completion or goal selection.
            *   **View:** Users can view detailed projections, including monthly payment schedules, total interest paid, and total payoff time.
            *   **Additional:** Recalculate (triggered by data changes in calibration).
        *   **Acceptance Criteria:**
            *   - [ ] Given a user has entered at least one debt and selected a goal, when they request a projection, then the system calculates and displays their current payoff trajectory.
            *   - [ ] The system calculates and displays an optimized payoff path (Snowball or Avalanche) based on the user's selected goal.
            *   - [ ] The projection clearly shows the interest savings and months saved compared to the current trajectory.
            *   - [ ] Users can view transparent breakdowns of timelines, total interest, and monthly payment impact for both current and optimized scenarios.

    *   **FR-005: Visualizations**
        *   **Description:** The system presents key debt data and projections through intuitive charts, specifically a payoff timeline chart (line graph) and an interest savings comparison (bar chart).
        *   **Entity Type:** System-Generated Analysis
        *   **User Benefit:** Makes complex financial data easy to understand at a glance, highlighting the impact of different strategies.
        *   **Primary User:** The Overwhelmed Debtor
        *   **Lifecycle Operations:**
            *   **View:** Users can view the generated charts.
        *   **Acceptance Criteria:**
            *   - [ ] Given payoff projections are available, when a user views the projection screen, then a line chart displays the payoff timeline for both current and optimized strategies.
            *   - [ ] A bar chart visually compares the total interest paid for both current and optimized strategies.

    *   **FR-006: AI Auto-Summary & Explanations**
        *   **Description:** Upon completion of debt entries, the system generates an AI-powered summary of all debts and metrics. It highlights personalized insights aligned with the user's stated goal and explains key numbers in an accessible language.
        *   **Entity Type:** System-Generated Analysis
        *   **User Benefit:** Reduces cognitive load by providing a concise, understandable overview and personalized context.
        *   **Primary User:** The Overwhelmed Debtor
        *   **Lifecycle Operations:**
            *   **Create:** Summary is generated automatically when debt entries are complete.
            *   **View:** Users can read the AI-generated summary and explanations.
        *   **Acceptance Criteria:**
            *   - [ ] Given all debts are entered, when the user proceeds to the projection screen, then an AI auto-summary is displayed.
            *   - [ ] The summary accurately reflects the user's total debt and key metrics.
            *   - [ ] The summary highlights insights relevant to the user's selected goal (e.g., "You could save X months by focusing on Y goal").
            *   - [ ] The summary explains complex numbers (e.g., APR, minimum payment impact) in simple terms.

    *   **FR-007: Lightweight Calibration**
        *   **Description:** After initial projections, the system prompts the user to verify if "these numbers look right." Users can then make limited edits to their debt data (add/remove a debt, adjust monthly payment for an existing debt) and trigger a recalculation of projections.
        *   **Entity Type:** User-Generated Content
        *   **User Benefit:** Builds confidence in the projections by allowing users to correct any input errors or adjust their planned monthly payment.
        *   **Primary User:** The Overwhelmed Debtor
        *   **Lifecycle Operations:**
            *   **View:** Users see the calibration prompt.
            *   **Edit:** Users can modify existing debt details (FR-002).
            *   **Create/Delete:** Users can add or remove debts (FR-002).
            *   **Additional:** Trigger recalculation of projections (FR-004).
        *   **Acceptance Criteria:**
            *   - [ ] Given initial projections are displayed, when the user views the screen, then a prompt "Do these numbers look right?" is visible.
            *   - [ ] When the user indicates numbers don't look right, then they are guided to an interface allowing them to add, remove, or edit existing debts (balance, APR, min payment).
            *   - [ ] After making changes in calibration, when the user confirms, then the projections are immediately recalculated and updated.

    *   **FR-008: Dynamic Call-to-Actions (CTAs)**
        *   **Description:** Call-to-action buttons dynamically change based on the user's stage in the journey and their stated payoff goal, guiding them through the core workflow.
        *   **Entity Type:** Configuration/System
        *   **User Benefit:** Provides clear, context-sensitive guidance, reducing decision fatigue and encouraging progression through the app.
        *   **Primary User:** All personas
        *   **Lifecycle Operations:**
            *   **View:** CTAs are displayed.
            *   **Interact:** Users click CTAs to proceed.
        *   **Acceptance Criteria:**
            *   - [ ] Given the landing page, when a user arrives, then the CTA "Show me my path forward" is displayed.
            *   - [ ] Given a user has entered one debt, when they are on the debt entry screen, then the CTA "Add another debt" is displayed.
            *   - [ ] Given all debts are entered and a goal is selected, when the user is ready for projection, then a goal-aligned CTA (e.g., "Let’s see how much faster I could get debt-free") is displayed.
            *   - [ ] Given the AI snapshot summary is displayed, when the user views it, then the CTA "Help me make sense of this" is displayed.
            *   - [ ] Given the calibration prompt is displayed, when the user indicates issues, then the CTA "These numbers don’t look right → Let’s fix it together" is displayed.

**3. USER WORKFLOWS**

*   **3.1 Primary Workflow: Instant Debt Snapshot & Optimized Payoff Projection**
    *   **Trigger:** User lands on the PathLight application.
    *   **Outcome:** User receives a personalized debt snapshot, an optimized payoff projection, and an AI-generated summary, feeling confident about a path forward.
    *   **Steps:**
        1.  User lands on the application and clicks "Show me my path forward."
        2.  User is prompted to register or log in (FR-001).
        3.  User registers/logs in and is directed to the debt entry screen.
        4.  User manually enters details for their first debt (FR-002).
        5.  User clicks "Add another debt" (FR-008) and repeats step 4 for all debts.
        6.  After entering all debts, user clicks the goal-aligned CTA (e.g., "Let’s see how much faster I could get debt-free") (FR-008).
        7.  System processes debts, generates current and optimized payoff projections (FR-004), and displays visualizations (FR-005).
        8.  System displays an AI auto-summary of their debt situation and insights (FR-006).
        9.  User reviews the projections and summary.
        10. User sees the calibration prompt "Do these numbers look right?" (FR-007).
        11. User can choose to proceed or click "These numbers don’t look right → Let’s fix it together" (FR-008) to adjust data.
    *   **Alternative Paths:**
        *   If user already has an account, they log in directly.
        *   If user adjusts data during calibration, the system recalculates and updates projections.

*   **3.2 Entity Management Workflows**

    *   **Debt Management Workflow**
        *   **Create Debt:**
            1.  User navigates to the debt entry screen.
            2.  User fills in required information (debt type, balance, APR, min payment).
            3.  User clicks "Add Debt" or similar.
            4.  System confirms creation and adds to the list.
        *   **Edit Debt:**
            1.  User locates an existing debt in their list.
            2.  User clicks an "Edit" option for that debt.
            3.  User modifies the desired information in the form.
            4.  User saves changes.
            5.  System confirms update and recalculates projections if applicable.
        *   **Delete Debt:**
            1.  User locates a debt to delete.
            2.  User clicks a "Delete" option for that debt.
            3.  System asks for confirmation.
            4.  User confirms deletion.
            5.  System removes the debt and confirms.
        *   **List Debts:**
            1.  User navigates to the debt list view.
            2.  System displays all user's debts.

    *   **Goal Management Workflow**
        *   **Select/Change Goal:**
            1.  User navigates to the goal selection area (e.g., settings or a dedicated section).
            2.  User selects a goal from predefined options.
            3.  System saves the new goal and updates projections accordingly.

*   **3.5 CONVERSATION SIMULATIONS (for AI Auto-Summary)**

    *   **Simulation 1: Primary Use Case - Happy Path (Goal: Pay off faster)**
        *   **Context:** User has entered 3 credit card debts and selected "Pay off debt faster" as their goal.
        *   **User:** (Implicit, completes debt entry and clicks "Let's see how much faster I could get debt-free")
        *   **PathLight AI:** "Here's what I'm seeing, Sarah! You have a total debt of $15,500 across 3 credit cards. Your current path suggests you'll be debt-free in about 48 months, paying $3,200 in interest. But, by using the 'Snowball' method, which prioritizes paying off your smallest debt first, you could be debt-free in just 36 months and save $800 in interest! This aligns perfectly with your goal of paying off debt faster."
        *   **User:** (Implicit, reviews summary and projections)
        *   **PathLight AI:** "Do these numbers look right? If not, we can fix them together."

    *   **Simulation 2: Primary Use Case - Happy Path (Goal: Reduce monthly payment)**
        *   **Context:** User has entered 2 student loans and 1 car loan, and selected "Reduce monthly payment" as their goal.
        *   **User:** (Implicit, completes debt entry and clicks "Show me how to lower my monthly payment")
        *   **PathLight AI:** "Alright, let's look at your path to lower payments! You're currently managing $45,000 in debt, with a combined minimum payment of $750. My analysis shows that by focusing on your highest interest debt first (the 'Avalanche' method), you could potentially reduce your overall monthly outflow by optimizing how you allocate any extra payments, or by exploring options like refinancing. While the Avalanche method primarily saves interest, understanding your total interest burden is key to long-term payment reduction. Let's explore how much interest you could save first, which often leads to faster payoff and thus, fewer payments overall."
        *   **User:** (Implicit, reviews summary and projections)
        *   **PathLight AI:** "Do these numbers look right? If not, we can fix them together."

**4. BUSINESS RULES**

*   **Entity Lifecycle Rules:**
    *   **User:** Full CRUD. Account deletion results in hard deletion of all associated data (debts, goals).
    *   **Debt:** Full CRUD. Only the owning user can create, view, edit, or delete their debts. Deletion is a hard delete.
    *   **Goal:** Create, View, Edit. Only the owning user can set or change their goal.
*   **Access Control:**
    *   Users can only access and manage their own debt and goal data. There is no sharing or multi-user access.
*   **Data Rules:**
    *   **Debt:**
        *   `debt_type`: Required. (e.g., 'Credit Card', 'Student Loan', 'Personal Loan', 'Mortgage', 'Car Loan').
        *   `current_balance`: Required, must be a positive number.
        *   `annual_percentage_rate (APR)`: Required, must be a positive number (percentage).
        *   `minimum_payment`: Required, must be a positive number.
        *   `name`: Optional, free text.
    *   **Goal:**
        *   `goal_type`: Required, must be one of the predefined options ('Pay off faster', 'Reduce monthly payment', 'Lower interest').
*   **Process Rules:**
    *   Payoff projections (FR-004) are automatically recalculated whenever a user's debt data (FR-002) or goal (FR-003) changes.
    *   The AI Auto-Summary (FR-006) is triggered and updated whenever debt data or goal changes.
    *   The optimized payoff path (Snowball/Avalanche) is selected based on the user's goal:
        *   "Pay off faster" or "Lower interest" goals will default to Avalanche (highest interest first).
        *   "Reduce monthly payment" goal will also default to Avalanche, as reducing interest is the primary driver for long-term payment reduction. (Note: Snowball is often perceived as faster due to psychological wins, but Avalanche saves more interest and often reduces overall time due to less interest accrual).

**5. DATA REQUIREMENTS**

*   **Core Entities:**
    *   **User**
        *   **Type:** System/Configuration
        *   **Attributes:** `id` (unique identifier), `email` (unique, required), `password_hash` (required), `name` (optional), `created_at`, `updated_at`.
        *   **Relationships:** Has many Debts, Has one Goal.
        *   **Lifecycle:** Full CRUD with account deletion option.
        *   **Retention:** User-initiated deletion with hard delete of all associated data.
    *   **Debt**
        *   **Type:** User-Generated Content
        *   **Attributes:** `id` (unique identifier), `user_id` (foreign key to User), `debt_type` (string, e.g., 'Credit Card'), `name` (string, optional), `current_balance` (decimal, required), `annual_percentage_rate` (decimal, required), `minimum_payment` (decimal, required), `created_at`, `updated_at`.
        *   **Relationships:** Belongs to User.
        *   **Lifecycle:** Full CRUD.
        *   **Retention:** Deleted when user account is deleted.
    *   **Goal**
        *   **Type:** User-Generated Content
        *   **Attributes:** `id` (unique identifier), `user_id` (foreign key to User), `goal_type` (string, e.g., 'Pay off faster'), `created_at`, `updated_at`.
        *   **Relationships:** Belongs to User.
        *   **Lifecycle:** Create, View, Edit.
        *   **Retention:** Deleted when user account is deleted.

**6. INTEGRATION REQUIREMENTS**

*   **External Systems:** None for MVP. All AI functionality is considered an internal component (e.g., a local model or a simple rule-based system for MVP).

**7. FUNCTIONAL VIEWS/AREAS**

*   **Primary Views:**
    *   **Landing Page:** Initial entry point with a clear call to action.
    *   **Registration/Login Page:** For user authentication.
    *   **Debt Entry Form:** Where users input individual debt details.
    *   **Debt List View:** Displays all entered debts, allowing for editing/deletion.
    *   **Projection Dashboard:** The core view displaying the Instant Debt Snapshot, payoff projections, visualizations, AI auto-summary, and calibration prompt.
    *   **Settings/Profile Area:** For managing user account details and potentially changing goals.
*   **Modal/Overlay Needs:**
    *   Confirmation dialogs for debt deletion and account deletion.
    *   Password reset flow.
*   **Navigation Structure:**
    *   **Persistent access to:** Debt List, Projection Dashboard, Settings.
    *   **Default landing:** After login, users land on the Projection Dashboard (if debts exist) or Debt Entry (if no debts).
    *   **Entity management:** Clear links from the Projection Dashboard to Debt List for editing/adding debts.

**8. MVP SCOPE & CONSTRAINTS**

*   **8.1 MVP Success Definition**
    *   The core workflow (User Registration -> Debt Entry -> Goal Selection -> Projection Display -> AI Summary -> Calibration) can be completed end-to-end by a new user.
    *   All features defined in Section 2.1 are fully functional and reliable.
    *   The application provides accurate debt payoff calculations and clear visualizations.

*   **8.2 In Scope for MVP**
    *   FR-001: User Authentication & Profile Management
    *   FR-002: Manual Debt Entry
    *   FR-003: Goal Setting
    *   FR-004: Payoff Projection & Analysis
    *   FR-005: Visualizations (Payoff Timeline, Interest Savings Comparison)
    *   FR-006: AI Auto-Summary & Explanations
    *   FR-007: Lightweight Calibration (add/remove debt, adjust monthly payment)
    *   FR-008: Dynamic Call-to-Actions (CTAs)

*   **8.3 Deferred Features (Post-MVP Roadmap)**
    *   **DF-001: CSV Upload for Debt Entry**
        *   **Description:** Allow users to upload a CSV file to quickly input multiple debts.
        *   **Reason for Deferral:** Not essential for the core validation flow of manual entry and initial projection. Adds complexity for parsing and error handling for bulk data.
    *   **DF-002: Debt Mix Pie Visualization**
        *   **Description:** A pie chart showing the distribution of debt types.
        *   **Reason for Deferral:** A secondary visualization; the core value is delivered by the payoff timeline and interest savings charts.
    *   **DF-003: Guided What-If Options (Pay Extra, Consolidate, Settle)**
        *   **Description:** Pre-built scenarios for users to explore the impact of paying extra, consolidating debts, or exploring settlement options.
        *   **Reason for Deferral:** Adds significant complexity for scenario modeling and calculation beyond the core payoff strategies. This is a secondary exploration flow, not part of the initial "aha moment."
    *   **DF-004: Scenario Exploration CTA**
        *   **Description:** A call-to-action to initiate the "What-If" scenario exploration.
        *   **Reason for Deferral:** Directly tied to the deferred "What-If" options.

**9. ASSUMPTIONS & DECISIONS**

*   **Business Model:** Assumed to be a free tool for the MVP, focusing on user acquisition and validation of the core value proposition.
*   **Access Model:** Individual user accounts; no team or multi-tenant features.
*   **Entity Lifecycle Decisions:**
    *   **User:** Full CRUD + account deletion. Deletion is a hard delete to ensure user data privacy.
    *   **Debt:** Full CRUD. Hard delete on user request.
    *   **Goal:** Create/View/Edit. Goals are simple selections, not complex entities.
*   **From User's Product Idea:**
    *   **Product:** PathLight is a web application designed to help users understand and manage their debt through personalized insights and payoff strategies.
    *   **Technical Level:** Not explicitly stated, but the request implies a user-friendly, intuitive interface.
*   **Key Assumptions Made:**
    *   The "AI Auto-Summary" for MVP will be a rule-based system or a simple text generation model that provides concise, goal-aligned summaries and explanations based on the user's entered debt data and selected goal. It will not involve complex conversational AI or external LLM API integrations for the MVP.
    *   The "optimized payoff path" will primarily focus on the Snowball and Avalanche methods, with the choice being determined by the user's stated goal (e.g., Avalanche for "lower interest" or "pay off faster").
    *   "Debt type" is primarily a descriptive label for the user and does not introduce complex, type-specific calculation rules for the MVP beyond the core balance, APR, and minimum payment.
*   **Questions Asked & Answers:** None, as the user's input was sufficiently clear for defining the MVP.

PRD Complete - Ready for development