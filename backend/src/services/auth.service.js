import { prisma } from "../prisma/client.js";

export const AuthService = {
    async findUserByEmail(email) {
        return prisma.user.findUnique({
            where: { email }
        });
    },

    async findUserById(id) {
        return prisma.user.findUnique({
            where: { id }
        });
    },

    async createUser(data) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
    },

    async upsertUser(email, passwordHash, name) {
       return prisma.user.upsert({
            where: { email },
            update: { passwordHash },
            create: {
                email,
                name,
                passwordHash,
                role: "USER",
            },
        });
    },

    async createSession(userId, sessionId, refreshTokenHash, expiresAt) {
        return prisma.session.create({
            data: {
                id: sessionId,
                userId,
                refreshTokenHash,
                expiresAt
            }
        });
    },

    async findSessionById(sessionId) {
        return prisma.session.findUnique({
            where: { id: sessionId }
        });
    },

    async deleteSession(sessionId) {
        return prisma.session.delete({
            where: { id: sessionId }
        });
    }
}
