import pino from "pino"

const _isDevelopment = process.env.NODE_ENV === "development"

const loggerConfig = {
    level: process.env.LOG_LEVEL || "info",
    timestamp: pino.stdTimeFunctions.isoTime,
}

export const logger = pino(loggerConfig)

export const childLogger = (context: string) =>
    logger.child({ context })
