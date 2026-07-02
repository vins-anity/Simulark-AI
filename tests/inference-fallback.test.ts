import { describe, expect, it } from "vitest";
import {
  DASHSCOPE_FALLBACK_MODEL,
  getInferenceModelChain,
  isRetryableInferenceError,
} from "../lib/inference-fallback";

describe("inference-fallback", () => {
  it("builds flash chain ending with qwen fallback", () => {
    expect(getInferenceModelChain("flash")).toEqual([
      "deepseek-v4-flash",
      DASHSCOPE_FALLBACK_MODEL,
    ]);
  });

  it("builds pro chain through flash before qwen fallback", () => {
    expect(getInferenceModelChain("pro")).toEqual([
      "deepseek-v4-pro",
      "deepseek-v4-flash",
      DASHSCOPE_FALLBACK_MODEL,
    ]);
  });

  it("treats provider quota and rate-limit errors as retryable", () => {
    expect(
      isRetryableInferenceError({ status: 429, message: "rate limit" }),
    ).toBe(true);
    expect(
      isRetryableInferenceError({
        message: "Model capacity exhausted for this workspace",
      }),
    ).toBe(true);
    expect(
      isRetryableInferenceError({ message: "invalid api key", status: 401 }),
    ).toBe(false);
  });
});
