import { prisma } from '../prisma/client.js';

export const RestService = {
    async getUsers({
        page = 1,
        limit = 10,
        search,
        role,
        sortBy = 'createdAt',
        order = 'desc',
    }) {
        const skip = (page - 1) * limit;
        const where = {};

        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        if (role) {
            where.role = role;
        }

        const [users, total] = await prisma.$transaction([
            prisma.restUser.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: order
                }
            }),
            prisma.restUser.count({ where })
        ]);

        return {
            users, total,
        };
    },



    // GET /users/:id
    async getUserById(id) {
        return prisma.restUser.findUnique({
            where: {
                id,
            },
        });
    },


    // POST USERS

    async createUser(data) {
        return prisma.restUser.create({
            data: {
                name: data.name,
                email: data.email,
                age: data.age,
                role: data.role || 'USER',
            },
        });
    },

    async replaceUser(data) {
        return prisma.restUser.update({
            where: {
                id,
            },
            data: {
                name: data.name,

                email: data.email,
                age: data.age,
                role: data.role,
            },
        });
    },

    async updateUser(id, data) {

        return prisma.restUser.update({
            where: {
                id,
            },

            data,
        });
    },
    async deleteUser(id) {

        return prisma.restUser.delete({
            where: {
                id,
            },
        });
    },

};
