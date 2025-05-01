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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = jwtDecode(token);
        dispatch({ type: "LOGIN", payload: user });
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
    setCheckingAuth(false);
  }, []);

  const login = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(`${base_url}/api/auth/login`, data);
      const { access_token } = response.data.data;
      localStorage.setItem("token", access_token);
      const user = jwtDecode(access_token);
      dispatch({ type: "LOGIN", payload: user });
      navigate("/");
    } catch (error) {
      console.log(error);

      setErrors(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        checkingAuth,
        login,
        logout,
        errors,
        loading,
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
