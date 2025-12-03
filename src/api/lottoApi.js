import axiosInstance from "./axiosInstance";

export const getLottoResults = async () => {
  try {
    const response = await axiosInstance.get("/lotto", { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.error("取得樂透資料失敗:", error);
    return null;
  }
};
