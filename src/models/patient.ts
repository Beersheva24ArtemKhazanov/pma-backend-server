export interface PatientData {
    id: number,
    age: number
    weight: number,
    childPugh: string,
    gfr: number,
    plt: number,
    wbc: number,
    sat: number,
    sodium: number,
    sensetivity: string | null
    contraindications: string[] | null
}

export interface Contraindication {
    contraindication: string,
}