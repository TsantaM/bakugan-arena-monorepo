import { PrismaClient } from './generated/prisma'
import { CheckGameFinished } from './functions/check-game-finished'

const prisma = new PrismaClient();
export default prisma;
export {
    CheckGameFinished
}