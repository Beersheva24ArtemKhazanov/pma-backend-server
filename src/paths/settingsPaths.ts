import config from 'config'
import { Request } from 'express';

const roleAdmin = config.get("accounting.admin_role");
const settingsPahs = {
    PUT: {
        "/": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleAdmin
        }
    },
    GET: {
        "/": {
            authentication: (req: Request) => "jwt",
            authorization: (req: Request) => req.role === roleAdmin
        }
    },

}
export default settingsPahs;