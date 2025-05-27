import postgres, { Sql } from "postgres"
import 'dotenv/config'

const {CONNECTION_DB_LINK, DB_NAME, DB_USERNAME, DB_PASSWORD} = process.env

class PostgresConnection {
    #query: Sql<{}>
    constructor(connectionStr: string | undefined) {
        this.#query = postgres({
            host: connectionStr ?? CONNECTION_DB_LINK,
            port: 5432,
            database: DB_NAME ?? 'postgres',
            username: DB_USERNAME ?? 'postgres',
            password: DB_PASSWORD,
            ssl: { rejectUnauthorized: false }
        })
    }

    getQuery() {
        return this.#query;
    }

    async close() {
        await this.#query.end();
    }
}

const connectionStr = CONNECTION_DB_LINK;
const PostgresClient = new PostgresConnection(connectionStr);
export default PostgresClient.getQuery();