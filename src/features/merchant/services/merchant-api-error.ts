import axios from "axios";
export class MerchantApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status = 0) {
    super(message);
    this.name = "MerchantApiError";
    this.code = code;
    this.status = status;
  }
}
export function merchantError(error: unknown): MerchantApiError {
  if (error instanceof MerchantApiError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const code =
      typeof error.response?.data?.code === "string"
        ? error.response.data.code
        : "REQUEST_FAILED";
    // Do not retain Axios config/request: it can contain credentials or personal data.
    const messages: Record<number, string> = {
      400: "Please check the form and try again.",
      401: "Verified access is required. Your session or credential may have expired.",
      403: "Your account or credential cannot perform this action.",
      404: "The requested record was not found.",
      409: "This request conflicts with an existing record.",
      422: "The parcel service could not accept these details.",
      502: "The parcel service returned an unavailable response.",
      503: "This service is currently unavailable.",
      504: "The request timed out. Its outcome may be uncertain.",
    };
    return new MerchantApiError(
      code,
      messages[status] ??
        "Unable to complete the request. Check your connection.",
      status,
    );
  }
  return new MerchantApiError(
    "REQUEST_FAILED",
    "Unable to complete the request. Please try again.",
  );
}
export async function safeRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw merchantError(error);
  }
}
export function unavailable(): never {
  throw new MerchantApiError(
    "INTEGRATION_UNAVAILABLE",
    "Live merchant access is not enabled yet.",
  );
}
