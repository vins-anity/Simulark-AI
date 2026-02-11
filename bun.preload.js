// Preload script for Bun to polyfill TextEncoderStream
// This runs before any other code

if (typeof globalThis.TextEncoderStream === "undefined") {
  // Use a simple object to mock TextEncoderStream
  const encoder = new TextEncoder();
  globalThis.TextEncoderStream = class TextEncoderStream extends (
    ReadableStream
  ) {
    constructor() {
      super({
        start(controller) {
          // No-op for mock
        },
      });
    }
  };
}
