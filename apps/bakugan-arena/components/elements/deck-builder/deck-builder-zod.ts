import z from "zod";

export const EditDeckNameSchema = z.object({
    nom : z.string()
})