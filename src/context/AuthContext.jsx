import axios from "axios";
import {
  createContext,
  useState,
  useContext,
  useReducer,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { base_url } from "../constants/axiosConfig";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "LOGOUT":
      return { ...state, user: null, isAuthenticated: false };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [{ user, isAuthenticated }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // التحقق من صلاحية التوكن
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenValid(token)) {
      try {
        const user = jwtDecode(token);
        dispatch({ type: "LOGIN", payload: user });
      } catch {
        localStorage.removeItem("token");
      }
    } else {
      localStorage.removeItem("token");
    }
    setCheckingAuth(false);
  }, []);

  const login = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(`${base_url}/api/auth/login`, data, {
        withCredentials: true,
      });
      const { access_token } = response.data.data;

      if (!isTokenValid(access_token)) {
        throw new Error("Invalid token received");
      }

      localStorage.setItem("token", access_token);
      const user = jwtDecode(access_token);
      dispatch({ type: "LOGIN", payload: user });
      setErrors(null); // Clear errors on successful login
      navigate("/");
    } catch (error) {
      setErrors(error.response?.data?.error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${base_url}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("token");
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  // Add a function to clear errors manually
  const clearErrors = () => setErrors(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        checkingAuth,
        login,
        logout,
        updateUser,
        errors,
        loading,
        clearErrors, // Provide clearErrors in context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}

export { useAuth, AuthProvider };
