import query from "../db/PostgresConnection"
import { Sql } from "postgres";
import { Settings } from "../models/settings";
import { createError } from "../errors/errors";

class SettingsService {
    #query: Sql<{}>
    constructor() {
        this.#query = query;
    }

    async setSettings(intervalForDoctor: number, intervalForNurse: number) {
        let resSettings: Settings[];
        try {
            resSettings = await this.#query`update settings set 
            interval_for_doctor=${intervalForDoctor},
            interval_for_nurse=${intervalForNurse} returning *`
        } catch (error) {
            throw createError(409, `Error is ${error.stack}`);
        }
        return resSettings[0];
    }

    async getSettings() {
        let resSettings: Settings[];
        try {
            resSettings = await this.#query`select * from settings`
        } catch (error) {
            throw createError(409, `Error is ${error.stack}`);
        }
        return resSettings[0];
    }
}

const settingsService = new SettingsService();
export default settingsService;