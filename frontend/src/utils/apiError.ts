import axios from "axios";

import type { ApiErrorResponse } from "../types/api";

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (!error.response) {
      return "Unable to reach the server. Please check that the API is running.";
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
};
