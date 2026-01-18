import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center">
      <h1 className="text-6xl m-0">404</h1>
      <h2 className="text-2xl mt-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 mt-2">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 bg-indigo-600 text-white no-underline rounded hover:bg-indigo-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
