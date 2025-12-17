# PathLight (Debt PayOff Optimizer)

PathLight is a personalized debt management application designed to help users understand their debt, create payoff strategies (Snowball/Avalanche), and track their journey to financial freedom.

## Project Structure

*   **`frontend/`**: React application (Vite, TypeScript, Tailwind CSS, shadcn/ui).
*   **`backend/`**: FastAPI application (Python, MongoDB/Motor).

## Features

*   **Secure Authentication**: User registration and login (JWT).
*   **Debt Management**: Add, edit, and delete debts.
*   **Goal Setting**: Choose between paying off faster, reducing monthly payments, or lowering interest.
*   **Projections**: Visual timeline and interest savings comparison for different strategies.
*   **Persist Data**: All data is stored securely in MongoDB Atlas.

## Getting Started

### Prerequisites

*   Node.js & npm
*   Python 3.10+
*   MongoDB Atlas Account

### Setup

1.  **Backend:**
    ```bash
    cd backend
    pip install -r requirements.txt
    # Configure .env with MONGODB_URI and JWT_SECRET
    uvicorn main:app --reload
    ```

2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## License

Private
