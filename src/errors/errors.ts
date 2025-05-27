import { NextFunction, Request, Response } from "express";
import { Error } from "../models/error";

export function createError(status: string | number, message: string) : Error {
    const er: Error = { status, message };
    return er;
}

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
    let { status, message } = error;
    status = status ?? 500;
    message = message ?? `internal server error ${error}`;
    res.status(Number(status)).send(message);
}