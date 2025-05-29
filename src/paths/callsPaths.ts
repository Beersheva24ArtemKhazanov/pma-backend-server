import config from 'config'
import { Request } from 'express';


const roleDoctor = config.get("accounting.doctor_role");
const roleNurse = config.get("accounting.nurse_role");
const callsPaths = {
    POST: {
        "/reject": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleDoctor
        },
        "/recommendation": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleDoctor || req.role === roleNurse
        }
    },
    PUT: {
        "/": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleNurse
        },
        "/approval/:id": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleDoctor
        },
        "/recommendation": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleDoctor || req.role === roleNurse
        }
    },
    GET: {
        "/approval/roles/:role": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleDoctor || req.role === roleNurse
        },
        "/:id": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleDoctor || req.role === roleNurse
        },
        "/approval/:id": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleDoctor || req.role === roleNurse
        },
        "/reject/:id": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleDoctor || req.role === roleNurse
        },
        "/recommendation/:id": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleDoctor || req.role === roleNurse
        },
    },
    DELETE: {
        "/recommendation/:id": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleDoctor
        }
    }
};
export default callsPaths;