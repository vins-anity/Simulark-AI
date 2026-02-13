// Preload script for Bun to polyfill TextEncoderStream
// This runs before any other code

if (typeof globalThis.TextEncoderStream === "undefined") {
  // Use a simple object to mock TextEncoderStream
  const _encoder = new TextEncoder();
  globalThis.TextEncoderStream = class TextEncoderStream extends (
    ReadableStream
  ) {
    constructor() {
      super({
        start(_controller) {
          // No-op for mock
        },
      });
    }
  };
}
