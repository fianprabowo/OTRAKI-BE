import { logEvent, logException, withTags } from "@demo/sdk";

export async function GET() {
  return withTags({ service: "be", endpoint: "/api/test/error" }, async () => {
    logEvent("be.test.error.start", {});
    const err = new Error("Demo BE error: triggered from /api/test/error");
    logException(err, { path: "/api/test/error" });
    throw err;
  });
}
