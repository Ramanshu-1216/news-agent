import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import logger from "../utils/logger";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        logger.warn("Validation error:", {
          errors: errorMessages,
          body: req.body,
          url: req.url,
          method: req.method,
        });

        res.status(400).json({
          error: {
            message: "Validation failed",
            details: errorMessages,
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      logger.error("Unexpected validation error:", error);
      res.status(500).json({
        error: {
          message: "Internal server error during validation",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        logger.warn("Parameter validation error:", {
          errors: errorMessages,
          params: req.params,
          url: req.url,
          method: req.method,
        });

        res.status(400).json({
          error: {
            message: "Invalid parameters",
            details: errorMessages,
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      logger.error("Unexpected parameter validation error:", error);
      res.status(500).json({
        error: {
          message: "Internal server error during parameter validation",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
};
