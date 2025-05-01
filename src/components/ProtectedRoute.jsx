import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, checkingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, checkingAuth, navigate]);

  if (checkingAuth) return <div>Loading...</div>; // or a spinner

  return children;
}
