export interface User {
    id: number;
    name: string;
    email: string;
    role: "USER" | "TECH" | "ADMIN";
    createdAt?: string;
}
