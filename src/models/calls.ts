export interface Call {
    id?: number,
    patientId: number,
    vasLevel: number,
    cure: string | null,
    timestamp: number
}

export interface Approval {
    id?: number,
    patientCallId: number,
    type: string,
    isApproved: boolean,
    timestamp: number
}

export interface Reject {
    id?: number,
    patientCallId: number,
    reason: string,
    timestamp: number
}

export interface Recommendation {
    id: number,
    approvalId: number,
    drug: string,
    route: string,
    dosing: string,
    interval: number
}