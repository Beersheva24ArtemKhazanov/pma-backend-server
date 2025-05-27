import config from "config"
import bcrypt from "bcrypt";
import query from "../db/PostgresConnection"
import { Sql } from "postgres";
import { ServiceAccount, User } from "../models/user";
import { createError } from "../errors/errors";
import JwtUtils from "../security/JwtUtils";

const adminRole = config.get("accounting.admin_role") as string;
const time_units = {
    "d": 1000 * 60 * 60 * 24,
    "h": 1000 * 60 * 60,
    "m": 1000 * 60,
    "s": 1000
};

class UsersService {
    #query: Sql<{}>
    constructor() {
        this.#query = query;
    }

    async addAdminAccount(account: User) {
        return this.#addAccountRole(account, adminRole);
    }

    async addAccount(account: User, role: string) {
        return this.#addAccountRole(account, role);
    }

    async #addAccountRole(account: User, role: string) {
        if (account.email === process.env.SUPERADMIN_USERNAME) {
            throw createError(409, `can't create user with e-mail ${account.email}`);
        }
        await this.#checkAccount(account.email);
        const serviceAccount = this.#toServiceAccount(account, role);
        let users: ServiceAccount[];
        try {
            users = await this.#query`insert into employees (name, role, email, password, expiration) values (
            ${serviceAccount.name}, 
            ${serviceAccount.role}, 
            ${serviceAccount.email}, 
            ${serviceAccount.hashPassword},
            ${serviceAccount.expiration as number})`
        } catch (error) {
            throw createError(409, error.stack);
        }
        return users[0];
    }

    async #checkAccount(email: string) {
        let resAccounts: ServiceAccount[];
        try {
           resAccounts = await this.#query`select *, password AS "hashPassword" from employees where email=${email}`;
        } catch (error) {
            throw createError(500, `Error is ${error.stack}`);
        }
        if (resAccounts[0]) {
            throw createError(500, `user with e-mail ${email} already exist`);
        }
    }

    async getAccount(email: string): Promise<ServiceAccount> {
        let resAccounts: ServiceAccount[];
        try {
           resAccounts = await this.#query`select id, name, role, email, password AS "hashPassword", expiration from employees where email=${email}`;
        } catch (error) {
            throw createError(500, `Error is ${error.stack}`);
        }
        this.#throwNotFound(resAccounts[0], email);
        return resAccounts[0];
    }

    #throwNotFound(resAccount: ServiceAccount, email: string) {
        if (!resAccount) {
            throw createError(404, `user with e-mail ${email} doesn't exist`);
        }
    }

    #toServiceAccount(account: User, role: string): ServiceAccount {
        const hashPassword = bcrypt.hashSync(account.password, config.get("accounting.salt_rounds"));
        const expiration = getExpiration();
        const serviceAccount: ServiceAccount = { email: account.email, name: account.name, role, hashPassword, expiration };
        return serviceAccount;
    }

    async setRole(email: string, role: string) {
        let resAccounts: ServiceAccount[];
        try {
            resAccounts = await this.#query`update employees set role=${role} where email=${email} returning *`;
        } catch (error) {
            throw createError(500, `Error is ${error.stack}`);
        }
        this.#throwNotFound(resAccounts[0], email);
        return resAccounts[0];
    }

    async updatePassword(email: string, password: string) {
        const serviceAccount = await this.getAccount(email);
        if (bcrypt.compareSync(password, serviceAccount.hashPassword)) {
            throw createError(400, `the new password should be diffenet from the existing one`);
        }
        serviceAccount.hashPassword = bcrypt.hashSync(password, config.get("accounting.salt_rounds"));
        serviceAccount.expiration = getExpiration();
        let resAccounts: ServiceAccount[];
        try {
            resAccounts = await this.#query`update employees set 
            password=${serviceAccount.hashPassword}, 
            expiration=${serviceAccount.expiration} 
            where email=${email} returning *`;
        } catch (error) {
            createError(400, `the password hasn't changed`);
        }
    }

    async deleteAccount(email: string) {
        const resAccounts: ServiceAccount[] = await this.#query`delete from employees where email=${email} returning *`;
        this.#throwNotFound(resAccounts[0], email);
    }

    async login(email: string, password: string) {
        const serviceAccount = await this.getAccount(email);
        this.#throwNotFound(serviceAccount, email);
        await this.checkLogin(serviceAccount, password);
        return JwtUtils.getJwt(serviceAccount);
    }

    async checkLogin(serviceAccount: ServiceAccount, password: string) {
        if (!serviceAccount || ! await bcrypt.compare(password, serviceAccount.hashPassword)) {
            throw createError(400, "wrong credential");
        }
        if (new Date().getTime() > serviceAccount.expiration) {
            throw createError(400, "password expired");
        }
    }
}

function getExpiration(): number {
    const expiresIn = convertTimeStrToInt(config.get("accounting.expired_in"));
    return new Date().getTime() + expiresIn;
}

export function convertTimeStrToInt(expiredInStr: string): number {
    const amount: number = Number(expiredInStr.split(/\D/)[0]);
    const parseArray = expiredInStr.split(/\d/);
    const index = parseArray.findIndex(e => !!e.trim());
    const unit = parseArray[index];
    const unitValue = time_units[unit];
    if (unitValue == undefined) {
        throw createError(500, `wrong configation: unit ${unit} doesn't exist`);
    }
    return amount * unitValue;
}

const usersService = new UsersService();
export default usersService;