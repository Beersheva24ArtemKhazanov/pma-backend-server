import query from "../db/PostgresConnection"
import { Sql } from "postgres";
import { Contraindication, PatientData,  } from "../models/patient";
import { createError } from "../errors/errors";

class PatientsService {
    #query: Sql<{}>
    constructor() {
        this.#query = query;
    }

    async getPatient(id: number) : Promise<PatientData> {
        let patients: PatientData[];
        const contraindications = await this.#getContraindications(id);
        try {
            patients = await this.#query`select * from patients where id=${id}`;

        } catch (error) {
            throw createError(500, `Error is ${error.stack}`);
        }
        this.#throwNotFound(patients[0], id);
        if (contraindications.length > 0) {
            patients[0].contraindications = [];
            contraindications.forEach((item) => {
                patients[0].contraindications?.push(item.contraindication);
            })
        }
        return patients[0];
    }

    async #getContraindications(id: number) {
        let contraindications: Contraindication[];
        try {
            contraindications = await this.#query`select * from patients_contraindications where patient_id=${id}`;
        } catch (error) {
            throw createError(500, `Error is ${error.stack}`);
        }
        return contraindications;
    }

    #throwNotFound(patient: PatientData, id: number) {
        if (!patient) {
            throw createError(404, `Patient with id ${id} not found`);
        }
    }
}

const patientsService = new PatientsService();
export default patientsService;