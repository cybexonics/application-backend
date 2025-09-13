import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/constent"

type UserRole = "student" | "teacher";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (data: Partial<User>) => void;
}

const AUTH_STORAGE_KEY = "eduApp_user";
const ROLE_KEY = "userRole";
const API_BASE_URL = `${API_URL}api`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchAuthenticatedUser = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("eduApp_token"); // Use token, not AUTH_STORAGE_KEY


      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`https://application-backend-rr3o.vercel.app/api/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response)
      if (!response.ok) {
        throw new Error("Failed to fetch authenticated user");
      }

      const userData = await response.json();
      console.log(userData)
      setUser(userData.data);
      navigate("/")
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  fetchAuthenticatedUser();
}, []);


  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(ROLE_KEY, JSON.stringify(user.role));
    }
  }, [user]);

  const login = async (email: string, password: string) => { 
  setIsLoading(true);
  try {
    const response = await fetch(
      `https://application-backend-rr3o.vercel.app/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    // Handle non-OK responses clearly
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid credentials");
      }
      throw new Error(`Login failed with status ${response.status}`);
    }

    // Try parsing JSON safely (OPTIONS/empty responses won’t break)
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Server returned invalid JSON");
    }

    const { token, user: foundUser } = data;

    if (!token || !foundUser) {
      throw new Error("Missing token or user data in response");
    }

    // Save token
    localStorage.setItem("eduApp_token", token);

    // Save user without password
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
    localStorage.setItem(ROLE_KEY, JSON.stringify(userWithoutPassword.role));
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};


  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://application-backend-rr3o.vercel.app/api/auth/signup`, {
  method: "POST",
  credentials: 'include',
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name, email, password }),
});

      console.log(response)

      if (!response.ok) {
        throw new Error("Failed to sign up");
      }

      const { user: newUser } = await response.json();

      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(ROLE_KEY, JSON.stringify(newUser.role));
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`https://application-backend-rr3o.vercel.app/api/user/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("eduApp_token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      console.log(updatedUser)
      setUser((prev) => ({
    ...prev,
    ...updatedUser,
  }));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("eduApp_token"); // Remove token as well
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
