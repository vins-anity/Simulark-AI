// TextEncoderStream polyfill for Bun compatibility
// This file must be imported before any Next.js code

if (typeof globalThis.TextEncoderStream === "undefined") {
  // @ts-ignore - Polyfill for Bun
  globalThis.TextEncoderStream = class TextEncoderStream extends (
    TransformStream<string, Uint8Array>
  ) {
    constructor() {
      const encoder = new TextEncoder();
      super({
        transform(chunk, controller) {
          controller.enqueue(encoder.encode(chunk));
        },
      });
    }
  };
}

export {};
