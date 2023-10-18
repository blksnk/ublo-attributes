import type { Response } from "express";

export const sendMessage = (res: Response, code: number, message: string) => {
  res.status(code).json({ code, message })
}

const wrapMessage = (prefix: string, message?: string): string => message ? `${prefix}: ${message}` : prefix;

const RESPONSES = {
  badRequest: {
    prefix: "Bad Request",
    code : 400,
  },
  internalError: {
    prefix: "Internal Server Error",
    code: 500,
  }
} as const;

export const badRequest = (res: Response, message?: string) => {
  const { prefix, code } = RESPONSES.badRequest;
  sendMessage(res, code, wrapMessage(prefix, message));
}

export const internalError = (res: Response, message?: string) => {
  const { prefix, code } = RESPONSES.internalError;
  sendMessage(res, code, wrapMessage(prefix, message));
}

