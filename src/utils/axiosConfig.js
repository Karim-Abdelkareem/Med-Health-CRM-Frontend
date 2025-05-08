import axios from "axios";
import { base_url } from "../constants/axiosConfig";

// إنشاء نسخة مخصصة من Axios
const axiosInstance = axios.create({
  baseURL: base_url,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// اعتراض الطلبات لإضافة التوكن
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// اعتراض الاستجابات للتعامل مع الأخطاء
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
