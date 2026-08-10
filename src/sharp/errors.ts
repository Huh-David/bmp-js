export class SharpAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SharpAdapterError";
  }
}

export class NotBmpInputError extends SharpAdapterError {
  constructor() {
    super("Input is not a BMP file.");
    this.name = "NotBmpInputError";
  }
}

const SHARP_LOAD_FAILURE_MESSAGE =
  "Unable to resolve optional peer dependency 'sharp' from this module. " +
  "Install it, or pass a module instance explicitly. " +
  "See the 'cause' property for the underlying resolution error.";

export class SharpModuleLoadError extends SharpAdapterError {
  constructor(message = SHARP_LOAD_FAILURE_MESSAGE, options?: { cause?: unknown }) {
    super(message);
    this.name = "SharpModuleLoadError";

    if (options && "cause" in options) {
      this.cause = options.cause;
    }
  }
}

export class InvalidSharpRawInputError extends SharpAdapterError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSharpRawInputError";
  }
}
