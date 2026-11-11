/// <reference types="node" />

declare module '@vercel/node' {
  import type { IncomingMessage, ServerResponse } from 'http';

  export interface VercelRequestCookies {
    [key: string]: string;
  }

  export interface VercelRequestQuery {
    [key: string]: string | string[];
  }

  export interface VercelRequest extends IncomingMessage {
    query: VercelRequestQuery;
    cookies: VercelRequestCookies;
    body: any;
  }

  export interface VercelResponse extends ServerResponse {
    send: (body: any) => VercelResponse;
    json: (jsonBody: any) => VercelResponse;
    status: (statusCode: number) => VercelResponse;
    redirect: (statusOrUrl: string | number, url?: string) => VercelResponse;
  }

  export type VercelApiHandler = (
    req: VercelRequest,
    res: VercelResponse
  ) => void | Promise<void>;
}
