import { ApiReference } from "@scalar/nextjs-api-reference";

// @ts-ignore - Scalar config types can be tricky with Next.js handler
export const GET = ApiReference({
  url: "/api/openapi.json",
  theme: "deepSpace",
});
