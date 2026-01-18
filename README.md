# Smart Expense Splitter

A full-stack MERN application for managing shared expenses in groups with automatic balance calculation, debt minimization, and email notifications.

## Features

- **User Authentication**: JWT-based authentication with email verification
- **Group Management**: Create and manage expense groups
- **Flexible Expense Splitting**: Equal, percentage, or exact amount splits
- **Automatic Balance Calculation**: Real-time balance tracking for all group members
- **Settlement Optimization**: Minimize the number of transactions needed
- **Email Notifications**: Automated emails for expenses, settlements, and reminders
- **Analytics Dashboard**: View spending patterns and category breakdowns
- **Role-Based Access**: Group admins can manage members and settings

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- Nodemailer for email services
- Node-cron for scheduled jobs

### Frontend
- React 19
- React Router DOM
- Axios for API calls
- Context API for state management

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Gmail account (for email notifications)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-expense-splitter
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
ENABLE_CRON_JOBS=false
```

4. For Gmail, you'll need to:
   - Enable 2-factor authentication
   - Generate an App Password (not your regular password)
   - Use the App Password in `EMAIL_PASS`

5. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
smart-expense-splitter/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and email configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Auth, validation, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── jobs/            # Scheduled jobs
│   │   ├── app.js           # Express app configuration
│   │   └── server.js        # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Route configuration
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Groups
- `GET /api/groups/my-groups` - Get user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:groupId` - Get group details
- `PUT /api/groups/:groupId` - Update group
- `DELETE /api/groups/:groupId` - Delete group
- `POST /api/groups/:groupId/members` - Add member
- `DELETE /api/groups/:groupId/members/:memberId` - Remove member

### Expenses
- `GET /api/expenses/group/:groupId` - Get group expenses
- `POST /api/expenses/group/:groupId` - Create expense
- `GET /api/expenses/:expenseId` - Get expense details
- `PUT /api/expenses/:expenseId` - Update expense
- `DELETE /api/expenses/:expenseId` - Delete expense

### Settlements
- `GET /api/settlements/group/:groupId/balances` - Get group balances
- `GET /api/settlements/group/:groupId/optimal` - Get optimal settlements
- `POST /api/settlements/group/:groupId` - Create settlement
- `PUT /api/settlements/:settlementId/confirm` - Confirm settlement

### Analytics
- `GET /api/analytics/user` - Get user analytics
- `GET /api/analytics/group/:groupId` - Get group analytics

## Key Features Explained

### Expense Splitting
- **Equal Split**: Divides amount equally among all participants
- **Percentage Split**: Custom percentage for each participant (must sum to 100%)
- **Exact Split**: Specify exact amount for each participant (must sum to total)

### Balance Calculation
- Automatically calculates who owes whom based on expenses and settlements
- Positive balance = user should receive money
- Negative balance = user owes money

### Settlement Optimization
- Uses a greedy algorithm to minimize the number of transactions
- Suggests optimal settlement paths to reduce complexity

### Email Notifications
- Expense added notifications
- Settlement confirmations
- Pending settlement reminders (via cron job)
- Password reset emails
- Email verification

## Development Notes

- The backend uses Decimal.js for precise financial calculations
- All amounts are rounded to 2 decimal places for display
- JWT tokens expire after 7 days
- Email notifications are sent asynchronously to avoid blocking API responses
- Cron jobs can be enabled by setting `ENABLE_CRON_JOBS=true` in backend `.env`

## License

This project is open source and available for educational purposes.
