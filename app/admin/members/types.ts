export interface Member {
    id: string
    name: string
    email: string
    role: string
    status: string
}

export interface Role {
    $id: string
    name: string
}

export interface Organization {
    $id: string
    name: string
}
