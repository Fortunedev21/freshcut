import { Resend } from 'resend';

// Lazy singleton — defers construction to first use so the missing-key error
// is thrown at request time, not at build/module-evaluation time.
let _resend: Resend | null = null;

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    if (!_resend) {
      _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return (_resend as any)[prop];
  },
});