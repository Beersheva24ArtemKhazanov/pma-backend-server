import { Sql } from "postgres";
import query from '../db/PostgresConnection'
import { Approval, Call, Recommendation, Reject } from "../models/calls";
import { createError } from "../errors/errors";
import config from 'config';
import { v4 as uuidv4 } from 'uuid';


class CallsService {
    #query: Sql<{}>
    constructor() {
        this.#query = query
    }

    async getCallsByRole(role: string) {
        let resCalls: Call[];
        const type = `to${role}`;
        const doctorRole = config.get('accounting.doctor_role');
        try {
            if (role === doctorRole) {
                resCalls = await this.#query`select id, patient_id as "patientId", vas_level as "vasLevel", cure, timestamp from patient_calls where id in (select patient_call_id from approvals where type=${type} and is_approved=false)`
            } else {
                resCalls = await this.#query`select id, patient_id as "patientId", vas_level as "vasLevel", cure, timestamp from patient_calls where 
                id in (select patient_call_id from approvals where type=${type}) or
                id in (select patient_call_id from rejects where reason='No recommendations for this patient call')`
            }
        } catch (error) {
            throw createError(409, `Error is ${error.stack}`);
        }
        if (resCalls.length === 0) {
            throw createError(404, `There is no calls by role: ${role}`);
        }
        return resCalls;
    }

    async getCall(patientCallId: string) {
        let resCalls: Call[];
        try {
            resCalls = await this.#query`select id, patient_id as "patientId", vas_level as "vasLevel", cure, timestamp from patient_calls where id = ${patientCallId}`
        } catch (error) {
            throw createError(409, `Error is ${error.stack}`);
        }
        return resCalls[0] ? resCalls[0] : null;
    }

    #throwNotFound(obj: Call | Approval | Recommendation | null, idName: string, type: string, id: string) {
        if (!obj) {
            throw createError(404, `${type} with ${idName}: ${id} doesn't exist`);
        }
    }

    async setCure(patientCallId: string, cure: string) {
        const call = await this.getCall(patientCallId);
        this.#throwNotFound(call, "id", "Call", patientCallId);
        let resCalls: Call[];
        try {
            resCalls = await this.#query`update patient_calls set cure=${cure} where id=${patientCallId} returning *`
        } catch (error) {
            throw createError(409, `Error is ${error.stack}`);
        }
        return resCalls[0];
    }

    async getApproval(patientCallId: string) {
        let resApprovals: Approval[];
        try {
            resApprovals = await this.#query`select id, patient_call_id as patientCallId, type, is_approved as isApproved, timestamp from approvals where patient_call_id=${patientCallId}`
        } catch (error) {
            throw createError(409, `Error is ${error.stack}`);
        }
        return resApprovals[0] ? resApprovals[0] : null;
    }

    async setApprove(patientCallId: string) {
        let resApprovals: Approval[];
        const approval = await this.getApproval(patientCallId);
        this.#throwNotFound(approval, "patientCallId", "Approval", patientCallId);
        const timestamp = Date.now();
        try {
            resApprovals = await this.#query`update approvals set type='toNurse', is_approved=true, timestamp=${timestamp} where patient_call_id=${patientCallId} returning *`
        } catch (error) {
            throw createError(409, `Error is ${error.stack}`);
        }
        return resApprovals[0];
    }

    async getReject(patientCallId: string) {
        let resRejects: Reject[];
        try {
            resRejects = await this.#query`select id, patient_call_id as patientCallId, reason, timestamp from rejects where patient_call_id=${patientCallId}`
        } catch (error) {
            throw createError(409, `Error is ${error.stack}`);
        }
        return resRejects[0] ? resRejects[0] : null;
    }

    async addOrUpdateReject(patientCallId: string, reason: string) {
        let resRejects: Reject[];
        const reject = await this.getReject(patientCallId);
        const timestamp = Date.now();
        if (reject) {
            try {
                resRejects = await this.#query`update rejects set reason=${reason}, timestamp=${timestamp} where patient_call_id=${patientCallId} returning *`
            } catch (error) {
                throw createError(409, `Error is ${error.stack}`);
            }
        } else {
            try {
                const id: BigInt = this.#getRandomId();
                resRejects = await this.#query`insert into rejects (id, patient_call_id as "patientCallId", reason, timestamp) values (
                ${Number(id)},
                ${patientCallId},
                ${reason},
                ${timestamp}
                ) returning *`
            } catch (error) {
                throw createError(409, `Error is ${error.stack}`);
            }
        }
        return resRejects[0];
    }

    async addRecommendation(recommendation: Recommendation) {
        let resRecommendations: Recommendation[];
            try {
                const id: BigInt = this.#getRandomId();
                resRecommendations = await this.#query`insert into recommendations (id, approval_id, route, active_moiety, dosing, interval) values (
                ${Number(id)},
                ${recommendation.approvalId},
                ${recommendation.route},
                ${recommendation.drug},
                ${recommendation.dosing},
                ${recommendation.interval}
                ) returning *`
            } catch (error) {
                throw createError(409, `Error is ${error.stack}`);
            }
        
        return resRecommendations[0];
    }

    async getRecommendations(approvalId: string) {
        let resRecommendations: Recommendation[];
            try {
                resRecommendations = await this.#query`select id, approval_id as "approvalId", route, active_moiety as "drug", dosing, interval from recommendations where approval_id = ${approvalId}`
            } catch (error) {
                throw createError(409, `Error is ${error.stack}`);
            }
        this.#throwNotFound(resRecommendations[0], "approval_id", "Recommendations", approvalId);
        return resRecommendations;
    }

    async updateRecommendation(recommendation: Recommendation) {
        let resRecommendations: Recommendation[];
        try {
            resRecommendations = await this.#query`update recommendations set 
                approval_id=${recommendation.approvalId},
                route=${recommendation.route},
                active_moiety=${recommendation.drug},
                dosing=${recommendation.dosing},
                interval=${Number(recommendation.interval)} where id=${recommendation.id} returning *`
        } catch (error) {
            throw createError(409, `Error is ${error.stack}`);
        }
        this.#throwNotFound(resRecommendations[0], "id", "Recommendation", String(recommendation.id));
        return resRecommendations[0];
    }

    async deleteRecommendation(recId: string) {
        let resRecommendations: Recommendation[];
        try {
            resRecommendations = await this.#query`delete from recommendations where id=${recId} returning *`
        } catch (error) {
            throw createError(409, `Error is ${error.stack}`);
        }
        this.#throwNotFound(resRecommendations[0], "id", "Recommendation", recId);
        return resRecommendations[0];
    }

    #getRandomId(): BigInt {
        const id = uuidv4();
        const msb = BigInt('0x' + id.replace(/-/g, '').substring(0, 16));
        return msb & (BigInt(1) << BigInt(63)) - BigInt(1);
    }
}

const callsService = new CallsService();
export default callsService;