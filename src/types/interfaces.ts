import { Request } from 'express';

export interface EmailOptions {
  to: string;
  subject: string;
  message: string;
  attachmentPath?: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
}

export interface EmailRequest extends Request {
  body: {
    to: string;
    subject: string;
    message: string;
    attachmentPath?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
