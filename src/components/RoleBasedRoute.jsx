import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RoleBasedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, checkingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkingAuth) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (!allowedRoles.includes(user?.role)) {
        navigate("/"); // إعادة توجيه إلى الصفحة الرئيسية إذا لم يكن لديه الصلاحية
      }
    }
  }, [isAuthenticated, checkingAuth, user, allowedRoles, navigate]);

  if (checkingAuth) {
    return <div>Loading...</div>;
  }

  return allowedRoles.includes(user?.role) ? children : null;
}
