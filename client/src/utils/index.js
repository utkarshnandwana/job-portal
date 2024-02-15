import axios from "axios";
const API_URL = "http://localhost:8800/api-v1";

export const API = axios.create({
  baseURL: API_URL,
  responseType: "json",
});

export const apiRequest = async ({ url, token, data, method }) => {
  try {
    const result = await API.request(url, {
      method: method,
      data: data,
      headers: {
        "content-type": "application/json",
        Authorization: token ? `Bearer ${token}` : "", 
      },
    });
    return result?.data;
  } catch (error) {
    console.error(error);

    // Handle the case when there is no response or response.data
    const err = error?.response?.data || {};
    return { status: err.success || false, message: err.message || "API request failed" };
  }
};


export const handleFileUpload = async (uploadFile) => {
  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("upload_preset", "jobfinder");

  try {
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dysprujzf/image/upload",
      formData
    );

    https: return response.data.secure_url;
  } catch (error) {
    console.log(error);
  }
};

export const updateURL = ({
  pageNum,
  query,
  cmpLoc,
  sort,
  navigate,
  location,
  jType,
  exp,
}) => {
  const params = new URLSearchParams();
  if (pageNum && pageNum > 1) {
    params.set("page", pageNum);
  }
  if (query) {
    params.set("search", query);
  }
  if (cmpLoc) {
    params.set("location", cmpLoc);
  }
  if (sort) {
    params.set("sort", sort);
  }
  if (jType) {
    params.set("jType", jType);
  }
  if (exp) {
    params.set("exp", exp);
  }
  const newURL = `${location.pathname}?${params.toString()}`;
  navigate(newURL, { replace: true });
  return newURL;
};