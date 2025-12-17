# Backend Development Plan — PathLight (Jolly Turtle Kick)

## 1️⃣ Executive Summary
This plan outlines the backend construction for **PathLight**, a debt management application. We will build a **FastAPI (Python 3.13)** application using **MongoDB Atlas (Motor driver)** for persistence.
The backend will replace the current local storage implementation, providing secure authentication and persistent data storage for Debts and Goals. All calculation logic (payoff projections, AI summaries) remains on the frontend for MVP efficiency, consuming the data provided by this backend.

**Constraints & Architecture:**
*   **Framework:** FastAPI (Async, Python 3.13)
*   **Database:** MongoDB Atlas (accessed via `motor` async driver)
*   **Git:** Single branch `main`
*   **Testing:** Manual UI verification per task (no CI/CD automation required for MVP)
*   **Infrastructure:** No Docker, local run connecting to cloud DB.

---

## 2️⃣ In-Scope & Success Criteria

### In-Scope Features
*   **Authentication:** Signup, Login, Logout, Profile Management (Delete).
*   **Debt Management:** Create, Read, Update, Delete (CRUD) debts.
*   **Goal Management:** Set, Update, and Retrieve the user's payoff goal.
*   **System Health:** Database connection status monitoring.

### Success Criteria
*   Frontend `auth.ts` and `debt-data.ts` successfully replaced with API calls.
*   All data persists across browser refreshes and sessions.
*   User data is strictly isolated (users cannot see others' debts).
*   Manual tests pass for every implemented feature.

---

## 3️⃣ API Design

**Base URL:** `/api/v1`

| Method | Path | Purpose | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/healthz` | Health check & DB ping | - | `{"status": "ok", "db": "connected"}` |
| **POST** | `/auth/signup` | Register new user | `{"email": "...", "password": "...", "name": "..."}` | `{"id": "...", "email": "..."}` |
| **POST** | `/auth/login` | Login user | `OAuth2PasswordRequestForm` | `{"access_token": "...", "token_type": "bearer"}` |
| **GET** | `/auth/me` | Get current user | - | `{"id": "...", "email": "...", "name": "..."}` |
| **POST** | `/auth/logout` | Logout (client token clear) | - | `{"message": "Logged out"}` |
| **DELETE** | `/auth/me` | Delete account | - | `{"message": "Account deleted"}` |
| **GET** | `/debts` | Get user's debts | - | `[{"id": "...", ...}]` |
| **POST** | `/debts` | Add new debt | `{"debtType": "...", "balance": 100...}` | `{"id": "...", ...}` |
| **PUT** | `/debts/{id}` | Update debt | `{"debtType": "...", ...}` | `{"id": "...", ...}` |
| **DELETE** | `/debts/{id}` | Delete debt | - | `{"message": "Deleted"}` |
| **GET** | `/goals` | Get user's goal | - | `{"goalType": "..."}` |
| **PUT** | `/goals` | Set/Update goal | `{"goalType": "..."}` | `{"goalType": "..."}` |

---

## 4️⃣ Data Model (MongoDB Atlas)

### `users` Collection
*   `_id`: ObjectId (mapped to `id` string in API)
*   `email`: String (Unique, Indexed)
*   `password_hash`: String
*   `name`: String (Optional)
*   `created_at`: DateTime

### `debts` Collection
*   `_id`: ObjectId
*   `user_id`: ObjectId (Reference to users)
*   `debt_type`: String (e.g., "Credit Card")
*   `name`: String (Optional)
*   `current_balance`: Decimal/Float
*   `apr`: Decimal/Float (Stored as decimal, e.g., 0.15 for 15%)
*   `min_payment`: Decimal/Float
*   `created_at`: DateTime
*   `updated_at`: DateTime

### `goals` Collection
*   `_id`: ObjectId
*   `user_id`: ObjectId (Unique Reference to users)
*   `goal_type`: String (Enum: "Pay off faster", "Reduce monthly payment", "Lower interest")
*   `updated_at`: DateTime

---

## 5️⃣ Frontend Audit & Feature Map

| Page/Component | Data Needed | Backend Endpoint | Notes |
| :--- | :--- | :--- | :--- |
| **RegisterPage** | User Registration | `POST /auth/signup` | |
| **LoginPage** | User Login | `POST /auth/login` | Returns JWT |
| **Dashboard** | User Profile | `GET /auth/me` | For name display |
| **Dashboard** | List Debts | `GET /debts` | Used for calculations |
| **Dashboard** | Get Goal | `GET /goals` | Used for strategy |
| **DebtEntryPage** | List/Add/Edit/Delete | `GET`, `POST`, `PUT`, `DELETE /debts` | Full CRUD |
| **GoalSelectionPage** | Set/Update Goal | `PUT /goals` | Upsert logic |
| **ProfilePage** | Delete Account | `DELETE /auth/me` | Cascading delete |

---

## 6️⃣ Configuration & ENV Vars
*   `APP_ENV`: `development`
*   `PORT`: `8000`
*   `MONGODB_URI`: Connection string for Atlas
*   `JWT_SECRET`: Secret key for signing tokens
*   `JWT_EXPIRE_MINUTES`: `1440` (24 hours)
*   `CORS_ORIGINS`: `http://localhost:5173` (Vite default)

---

## 7️⃣ Background Work
*   None required for MVP. All operations are direct synchronous CRUD.

---

## 8️⃣ Integrations
*   None. (AI Summary is local rule-based).

---

## 9️⃣ Testing Strategy (Manual via Frontend)
*   **Validation:** All features are validated by running the frontend and interacting with the UI.
*   **Process:**
    1.  Implement Backend Task.
    2.  Update Frontend API client (e.g., `lib/debt-data.ts`) to point to localhost.
    3.  Perform **Manual Test Step**.
    4.  Verify success.
    5.  Commit & Push.

---

## 🔟 Dynamic Sprint Plan (S0 → S3)

### 🧱 S0 – Environment Setup & Foundation

**Objectives:**
*   Initialize FastAPI project structure.
*   Connect to MongoDB Atlas using `motor`.
*   Implement Global Exception Handler & CORS.
*   Create `/healthz` endpoint.

**Tasks:**
1.  **Project Init:** Create `requirements.txt`, `main.py`, `.env`, `.gitignore`.
    *   *Manual Test:* Run `uvicorn main:app --reload`.
    *   *User Test Prompt:* "Run the server and check if it starts without errors."
2.  **DB Connection:** Configure `motor` client and `get_database` dependency.
    *   *Manual Test:* Hit `/healthz` ensures DB ping works.
    *   *User Test Prompt:* "Open browser to http://localhost:8000/api/v1/healthz and confirm `db: connected`."
3.  **CORS Setup:** Allow `http://localhost:5173`.
    *   *Manual Test:* Fetch `/healthz` from browser console on frontend port.
    *   *User Test Prompt:* "From the frontend console, fetch the health endpoint and confirm no CORS error."

**Definition of Done:**
*   Backend is running.
*   Atlas is connected.
*   Health endpoint returns 200 OK.

---

### 🧩 S1 – Authentication System

**Objectives:**
*   Secure user access with JWT.
*   Persist users in MongoDB.

**Tasks:**
1.  **User Model & Auth Utils:** Create Pydantic models (UserCreate, UserResponse) and password hashing (Passlib/Argon2).
    *   *Manual Test:* N/A (Code foundation).
2.  **Signup Endpoint:** `POST /auth/signup`.
    *   *Manual Test:* Use Swagger UI to create a user. Check MongoDB Atlas collection.
    *   *User Test Prompt:* "Register a user via Swagger and verify the document exists in MongoDB."
3.  **Login Endpoint:** `POST /auth/login` (OAuth2 spec).
    *   *Manual Test:* Login via Swagger, receive Access Token.
    *   *User Test Prompt:* "Login via Swagger and copy the generated Bearer token."
4.  **Get Me Endpoint:** `GET /auth/me`.
    *   *Manual Test:* Authorize in Swagger with token, call endpoint.
    *   *User Test Prompt:* "Use the token to call /me and verify it returns your user details."
5.  **Frontend Integration (Auth):** Update `frontend/src/lib/auth.ts` to use these API endpoints.
    *   *Manual Test:* Register and Login via the actual React App.
    *   *User Test Prompt:* "Register a new account on the Frontend. Log out, then Log in again. Verify you reach the dashboard."

**Definition of Done:**
*   Users can register and log in via the Frontend.
*   Session persists on refresh (via `getCurrentUser` logic).

---

### 💰 S2 – Debt Management (CRUD)

**Objectives:**
*   Enable users to manage their debt portfolio.
*   Enforce ownership (users only see their own debts).

**Tasks:**
1.  **Debt Model:** Pydantic models for Debt (Schema matching frontend `Debt` interface).
2.  **Create & Read Endpoints:** `POST /debts`, `GET /debts`.
    *   *Manual Test:* Add a debt via Swagger. List debts. Verify `user_id` is attached automatically from token.
    *   *User Test Prompt:* "Create a debt using Swagger. Call GET /debts and verify it appears."
3.  **Update & Delete Endpoints:** `PUT /debts/{id}`, `DELETE /debts/{id}`.
    *   *Manual Test:* Edit the debt created above. Delete it.
    *   *User Test Prompt:* "Update the debt balance. Verify change. Then delete it and verify list is empty."
4.  **Frontend Integration (Debts):** Update `frontend/src/lib/debt-data.ts` to call API.
    *   *Manual Test:* Use "Debt Entry Page" in Frontend. Add 3 debts. Refresh page.
    *   *User Test Prompt:* "Add 'Visa', 'Mastercard', and 'Loan' in the app. Refresh. Verify all 3 are still listed."

**Definition of Done:**
*   Debt Entry Page functions fully with real backend data.
*   Data persists after server restart.

---

### 🎯 S3 – Goals & Account Cleanup

**Objectives:**
*   Persist user payoff strategy goals.
*   Allow account deletion.

**Tasks:**
1.  **Goal Endpoints:** `GET /goals` and `PUT /goals`.
    *   *Manual Test:* Set goal via Swagger. Retrieve it. Update it.
    *   *User Test Prompt:* "Set goal to 'Pay off faster'. Verify retrieval. Change to 'Lower interest'. Verify update."
2.  **Delete Account:** `DELETE /auth/me`. Should delete User, Debts, and Goals.
    *   *Manual Test:* Call endpoint. Check MongoDB collections are empty for that ID.
    *   *User Test Prompt:* "Delete the account via Swagger. Verify in MongoDB that the user and their debts are gone."
3.  **Frontend Integration (Final):** Update Goal functions in `debt-data.ts` and Delete function in `auth.ts`.
    *   *Manual Test:* Select Goal in App. Go to Dashboard. Delete Account from Profile (if UI exists) or verify Goal persistence.
    *   *User Test Prompt:* "Select a goal. Refresh Dashboard. Verify goal is remembered. Finally, test account deletion."

**Definition of Done:**
*   Full user journey: Signup -> Add Debts -> Set Goal -> View Dashboard -> Logout/Delete works end-to-end.
*   Project ready for handover.