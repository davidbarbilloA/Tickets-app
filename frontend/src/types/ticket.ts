export interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    creatorEmail: string;
    assignedToEmail: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
}