import jwt from "jsonwebtoken"
import config from "config"
import { ServiceAccount, User } from "../models/user";
import { convertTimeStrToInt } from "../service/usersService";

export default class JwtUtils {

    static getJwt(serviceAccount: ServiceAccount) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
        return jwt.sign(
            { role: serviceAccount.role, subject: serviceAccount.email },
            secret,
            { expiresIn: convertTimeStrToInt(config.get("accounting.expired_in")) }
        );
    }

    static verifyJwt(token: string) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
        return jwt.verify(token, secret);
    }

}