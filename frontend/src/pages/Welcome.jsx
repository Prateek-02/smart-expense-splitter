import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Welcome = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-16 px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Smart Expense Splitter
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Split expenses smartly. Track balances automatically. Settle up effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-4 bg-white text-indigo-600 no-underline rounded-lg font-bold text-lg transition-transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-transparent text-white no-underline rounded-lg font-bold text-lg border-2 border-white transition-colors hover:bg-white/10"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-8 max-w-7xl mx-auto">
        <h2 className="text-center text-4xl mb-12 text-gray-800">
          Why Choose Smart Expense Splitter?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="💰"
            title="Flexible Splitting"
            description="Split expenses equally, by percentage, or exact amounts. Choose the method that works best for your group."
          />
          <FeatureCard
            icon="⚖️"
            title="Automatic Balance Calculation"
            description="No more manual calculations! The app automatically tracks who owes whom in real-time across all your groups."
          />
          <FeatureCard
            icon="🎯"
            title="Settlement Optimization"
            description="Minimize the number of transactions needed. Our algorithm suggests the most efficient way to settle up."
          />
          <FeatureCard
            icon="📧"
            title="Email Notifications"
            description="Get notified when expenses are added, settlements are confirmed, or when you have pending dues."
          />
          <FeatureCard
            icon="📊"
            title="Analytics & Insights"
            description="View spending patterns, category breakdowns, and track your financial activity across all groups."
          />
          <FeatureCard
            icon="👥"
            title="Group Management"
            description="Create groups for trips, shared apartments, or any occasion. Manage members and permissions easily."
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-4xl mb-12 text-gray-800">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Create a Group"
              description="Start by creating a group for your trip, apartment, or any shared expenses."
            />
            <StepCard
              number="2"
              title="Add Expenses"
              description="Record expenses with flexible splitting options - equal, percentage, or exact amounts."
            />
            <StepCard
              number="3"
              title="Track Balances"
              description="View real-time balances showing who owes whom. No manual calculations needed."
            />
            <StepCard
              number="4"
              title="Settle Up"
              description="Use our optimization algorithm to settle debts with minimal transactions."
            />
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-16 px-8 max-w-7xl mx-auto">
        <h2 className="text-center text-4xl mb-12 text-gray-800">
          Perfect For
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <UseCaseCard
            emoji="✈️"
            title="Group Trips"
            description="Split hotel costs, meals, and activities during your vacation with friends or family."
          />
          <UseCaseCard
            emoji="🏠"
            title="Shared Living"
            description="Track rent, utilities, groceries, and other shared expenses with roommates."
          />
          <UseCaseCard
            emoji="🎉"
            title="Events & Parties"
            description="Manage expenses for birthdays, celebrations, or team outings effortlessly."
          />
          <UseCaseCard
            emoji="💼"
            title="Business Expenses"
            description="Track shared business costs, team lunches, and project expenses with colleagues."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-16 px-8 text-center">
        <h2 className="text-4xl mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of users who are simplifying their expense management.
        </p>
        <Link
          to="/register"
          className="inline-block px-10 py-4 bg-white text-indigo-600 no-underline rounded-lg font-bold text-xl transition-transform hover:scale-105"
        >
          Create Free Account
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-8 text-center">
        <p className="m-0 opacity-80">
          © 2024 Smart Expense Splitter. Built with React, Node.js, and MongoDB.
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-md text-center transition-transform hover:-translate-y-1 hover:shadow-lg">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-2xl mb-4 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div className="bg-gray-50 p-8 rounded-xl border-2 border-gray-200 text-center">
    <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
      {number}
    </div>
    <h3 className="text-xl mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const UseCaseCard = ({ emoji, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-md text-center">
    <div className="text-5xl mb-4">{emoji}</div>
    <h3 className="text-xl mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default Welcome;
