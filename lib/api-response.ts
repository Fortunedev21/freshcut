import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  error: string | Error,
  status: number = 400
) {
  const message = error instanceof Error ? error.message : error;
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export function validateRequest(
  method: string,
  allowedMethods: string[]
): boolean {
  return allowedMethods.includes(method);
}
