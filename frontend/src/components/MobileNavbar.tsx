
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Book, Calendar, User } from "lucide-react";

const MobileNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Return early if on auth pages
  if (location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname === "/forgot-password" ||
      location.pathname === "/reset-password" ||
      location.pathname === "/terms" ||
      location.pathname === "/privacy") {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const getNavItems = () => {
    const commonItems = [
      {
        path: "/",
        icon: <Home className="h-5 w-5" />,
        label: "Home"
      },
      {
        path: "/courses",
        icon: <Book className="h-5 w-5" />,
        label: "Courses"
      },
    ];

    // Role-specific navigation
    if (user?.role === "teacher") {
      return [
        ...commonItems,
        {
          path: "/schedule",
          icon: <Calendar className="h-5 w-5" />,
          label: "Schedule"
        },
        {
          path: "/profile",
          icon: <User className="h-5 w-5" />,
          label: "Profile"
        }
      ];
    } else {
      return [
        ...commonItems,
        {
          path: "/my-learning",
          icon: <Calendar className="h-5 w-5" />,
          label: "My Learning"
        },
        {
          path: "/profile",
          icon: <User className="h-5 w-5" />,
          label: "Profile"
        }
      ];
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200 z-10">
      <div className="flex items-center justify-around h-16">
        {getNavItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center px-2 py-2 ${
              isActive(item.path)
                ? "text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavbar;
