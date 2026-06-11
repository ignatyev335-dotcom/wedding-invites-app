import { Request, Response, NextFunction } from 'express';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'date';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

/**
 * Request body validation middleware factory.
 * Validates request body against a set of validation rules.
 */
export function validateBody(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    const body = req.body;

    for (const rule of rules) {
      const value = body[rule.field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${rule.field}' is required`);
        continue;
      }

      // Skip further checks if value is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      if (rule.type) {
        let valid = true;
        switch (rule.type) {
          case 'string':
            valid = typeof value === 'string';
            break;
          case 'number':
            valid = typeof value === 'number' && !isNaN(value);
            break;
          case 'boolean':
            valid = typeof value === 'boolean';
            break;
          case 'array':
            valid = Array.isArray(value);
            break;
          case 'object':
            valid = typeof value === 'object' && !Array.isArray(value) && value !== null;
            break;
          case 'email':
            valid = typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            break;
          case 'date':
            valid = !isNaN(Date.parse(value));
            break;
        }
        if (!valid) {
          errors.push(`Field '${rule.field}' must be of type ${rule.type}`);
          continue;
        }
      }

      // String length validation
      if (typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
          errors.push(`Field '${rule.field}' must be at least ${rule.min} characters`);
        }
        if (rule.max !== undefined && value.length > rule.max) {
          errors.push(`Field '${rule.field}' must be at most ${rule.max} characters`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`Field '${rule.field}' has invalid format`);
        }
      }

      // Number range validation
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`Field '${rule.field}' must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`Field '${rule.field}' must be at most ${rule.max}`);
        }
      }

      // Custom validation
      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `Field '${rule.field}' is invalid`);
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    next();
  };
}

/**
 * URL parameter validation middleware factory.
 * Ensures specified URL parameters are present and numeric.
 */
export function validateParams(...paramNames: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const param of paramNames) {
      const value = req.params[param];
      if (!value || value.trim() === '') {
        errors.push(`Parameter '${param}' is required`);
        continue;
      }
      if (param === 'id' && isNaN(Number(value))) {
        errors.push(`Parameter '${param}' must be a number`);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ error: 'Invalid parameters', details: errors });
      return;
    }

    next();
  };
}
