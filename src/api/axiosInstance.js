import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:5000", // 設定後端 API 位址
  timeout: 5000, // 設定請求超時時間
});

// 全域錯誤攔截
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API 錯誤:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
