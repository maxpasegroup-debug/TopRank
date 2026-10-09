import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: ["password", "passwordHash", "token", "authorization", "cookie"],
    remove: true,
  },
});
