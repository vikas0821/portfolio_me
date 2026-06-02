import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

function extractData(response) {
  const { responseCode, responseMessage, data } = response.data;
  if (responseCode === "00") return data;
  toast.error(responseMessage || "Something went wrong");
  return null;
}

export const fetchPortfolio = async () => {
  try {
    const response = await axiosInstance.get("/portfolio/getPortfolio");
    return extractData(response);
  } catch (error) {
    toast.error(error?.response?.data?.responseMessage || error.message || "Error fetching portfolio");
    return null;
  }
};

export const sendContactMessage = async (formData) => {
  try {
    const response = await axiosInstance.post("/portfolio/sendContactMessage", formData);
    return extractData(response);
  } catch (error) {
    toast.error(error?.response?.data?.responseMessage || error.message || "Error sending message");
    return null;
  }
};

export const downloadResume = async () => {
  try {
    const response = await axiosInstance.get("/portfolio/downloadResume", {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.responseMessage || error.message || "Error downloading resume");
    return null;
  }
};

export const fetchCertificates = async () => {
  try {
    const response = await axiosInstance.get("/portfolio/getCertificates");
    return extractData(response);
  } catch (error) {
    toast.error(error?.response?.data?.responseMessage || error.message || "Error fetching certificates");
    return null;
  }
};

export const fetchBlogPosts = async () => {
  try {
    const response = await axiosInstance.get("/portfolio/getBlogPosts");
    return extractData(response);
  } catch (error) {
    toast.error(error?.response?.data?.responseMessage || error.message || "Error fetching blog posts");
    return null;
  }
};

export const fetchBlogPost = async (slug) => {
  try {
    const response = await axiosInstance.get(`/portfolio/getBlogPost/${slug}`);
    return extractData(response);
  } catch (error) {
    toast.error(error?.response?.data?.responseMessage || error.message || "Error fetching blog post");
    return null;
  }
};
