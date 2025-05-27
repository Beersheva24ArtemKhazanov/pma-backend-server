
export interface User {
    id?: number,
    name: string
    role: string,
    email: string,
    password: string
}

export interface ServiceAccount {
    id?: number
    email: string,
    name: string, 
    role: string, 
    hashPassword: string, 
    expiration: number
}