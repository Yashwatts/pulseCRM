// A custom logger wrapper that can be swapped out for Winston or Pino in production.

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? meta : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? meta : '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta ? meta : '');
  }
};
