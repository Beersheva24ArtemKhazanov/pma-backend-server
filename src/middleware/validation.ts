import  { Schema } from "joi";
import { createError } from "../errors/errors.js";
import { NextFunction, Request, Response } from "express";

export function valitator(schema: Schema, objectToValid: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req[objectToValid], { abortEarly: false });
        if (error) {
            throw createError(400, error.details.map(o => o.message).join(", "));
        }
        next();
    };
}