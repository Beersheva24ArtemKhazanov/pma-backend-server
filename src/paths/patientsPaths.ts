import { Request } from "express";
import  config  from "config";

const roles: string[] = config.get("accounting.roles");
const patientsPaths = {
    GET: {
        "/:id": {
                    authentication: (req: Request) => "jwt",
                    authorization: (req: Request) => roles.includes(req.role)
                }
    }
}

export default patientsPaths;