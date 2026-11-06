import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = "en";
  const messages = (await import("../messages/en.json")).default;

  return {
    locale,
    messages,
  };
});
