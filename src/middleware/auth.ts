import { NextFunction, Request, Response } from "express";
import JwtUtils from "../security/JwtUtils";
import expressAsyncHandler from "express-async-handler";
import { createError } from "../errors/errors";
import usersService from "../service/usersService";
import 'dotenv/config'

declare global {
    namespace Express {
        interface Request {
            user?: string;
            role: string;
            authType?: string;
        }
    }
}


const BEARER = "Bearer ";
const BASIC = "Basic ";

export function authenticate() {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.header("Authorization");
        if (authHeader) {
            if (authHeader.startsWith(BEARER)) {
                await jwtAuthentication(req, authHeader);
            } else if (authHeader.startsWith(BASIC)) {
                await basicAuthentication(req, authHeader);
            }
        }
        next();
    };
}

async function jwtAuthentication(req : Request, authHeader: string) {
    const token = authHeader.substring(BEARER.length);
    try {
        const payload = JwtUtils.verifyJwt(token);
        req.user = typeof payload !== "string" ? payload.subject : undefined;
        req.role = typeof payload !== "string" && "role" in payload ? payload.role : undefined;
        req.authType = "jwt";
    } catch (error) {
    }
}

async function basicAuthentication(req: Request, authHeader: string) {
    const emailPasswordBase64 = authHeader.substring(BASIC.length);
    const emailPassword = Buffer.from(emailPasswordBase64, "base64").toString("utf-8");
    const [email, password] = emailPassword.split(":");

    try {
        if (email === process.env.SUPERADMIN_USERNAME) {
            if (password === process.env.SUPERADMIN_PASSWORD) {
                req.user = process.env.SUPERADMIN_USERNAME;
                req.role = "";
                req.authType = "basic";
            }
        } else {
            const serviceAccount = await usersService.getAccount(email);
            await usersService.checkLogin(serviceAccount, password);
            req.user = email;
            req.role = serviceAccount.role;
            req.authType = "basic";
        }
    } catch (error) { 
    }
}

export function checkAuthentication(paths) {
    return expressAsyncHandler(async (req: Request, res, next) => {
        const { authentication, authorization } = paths[req.method][req.route.path];
        if (!authorization) {
            throw createError(500, "security configuration not provided");
        }
        if (authentication(req)) {
            if (req.authType !== authentication(req)) {
                throw createError(401, "authentication error");
            }
        }
        if (!await authorization(req)) {
            throw createError(403, "action not permited");
        }
        next();
    });
}