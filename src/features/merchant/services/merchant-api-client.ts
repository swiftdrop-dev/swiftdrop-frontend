import axios from "axios";
// Separate instance protects other roles from merchant auth, base URL and error policies.
export function createMerchantApiClient(baseURL: string) {
  const url = new URL(baseURL);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.protocol !== "https:" &&
      !(
        import.meta.env.DEV && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)
      ))
  ) {
    throw new Error("An approved merchant API base URL is required.");
  }
  return axios.create({
    baseURL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });
}
