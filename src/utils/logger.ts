import { createLogger, format, transports } from 'winston';
import * as path from 'path';
import * as fs from 'fs';

const logsDir = path.join(process.cwd(), 'reports', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] [${level.toUpperCase()}] ${message}\n${stack}`
      : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  })
);

export const logger = createLogger({
  level: 'debug',
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        logFormat
      )
    }),
    new transports.File({
      filename: path.join(logsDir, 'test-run.log'),
      level: 'debug'
    }),
    new transports.File({
      filename: path.join(logsDir, 'errors.log'),
      level: 'error'
    })
  ]
});
