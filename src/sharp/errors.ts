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

export class SharpModuleLoadError extends SharpAdapterError {
  constructor(
    message = "Unable to load optional peer dependency 'sharp'. Install it or pass a module instance.",
  ) {
    super(message);
    this.name = "SharpModuleLoadError";
  }
}

export class InvalidSharpRawInputError extends SharpAdapterError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSharpRawInputError";
  }
}
