import { TaggedError } from "./tagged-error";

export class EmailInternalError extends TaggedError<'EmailError'> {
  constructor(options: ErrorOptions = {}) {
    super('Email error', options);
  }
}

export type EmailError = EmailInternalError;
