import { PrismaClient } from "./generated/prisma/index.js";
import { CheckGameFinished } from "./functions/check-game-finished.js"

const prisma = new PrismaClient();
export default prisma;
export * from '@prisma/client'
export {
    CheckGameFinished
}