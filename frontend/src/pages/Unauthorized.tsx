
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-blue-50">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 flex items-center justify-center bg-red-100 text-red-600 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This might be due to your user role.
        </p>

        <div className="space-y-3">
          <Button className="w-full blue-gradient" asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/login">Switch Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
