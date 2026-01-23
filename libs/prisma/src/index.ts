import { PrismaClient } from "../generated/prisma/client.js";
import { CheckGameFinished } from "./functions/check-game-finished.js"

const prisma = new PrismaClient();
export default prisma;
export {
    CheckGameFinished
}