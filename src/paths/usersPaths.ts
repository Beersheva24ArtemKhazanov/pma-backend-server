import config from "config";
import { Request } from "express";
import 'dotenv/config'


const adminRole = config.get("accounting.admin_role");
const actionJwtAdmin = {
    authentication: (req: Request) => "jwt",
    authorization: (req: Request) => req.role === adminRole
};
const usersPaths = {
    POST: {
        "/admin": {
            authentication: (req: Request) => "basic",
            authorization: (req: Request) => req.user === process.env.SUPERADMIN_USERNAME
        },
        "/user": actionJwtAdmin
    },
    PUT: {
        "/role": actionJwtAdmin,
        "/password": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === adminRole || req.user === req.body.email
        }
    },
    GET: {
        "/:email": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === adminRole || req.user === req.params.email
        }
    },
    DELETE: {
        "/:email": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === adminRole || req.user === req.params.email
        }
    }
};
export default usersPaths;