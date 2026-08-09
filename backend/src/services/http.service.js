import { prisma } from "../prisma/client.js";

export const HttpService = {
  async getMethodsUsers() {
    return prisma.httpLabItem.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async createMethodsUser(data) {
    return prisma.httpLabItem.create({
      data,
    });
  },

  async getMethodsUserById(id) {
    return prisma.httpLabItem.findUnique({
      where: { id },
    });
  },

  async updateMethodsUser(id, data) {
    return prisma.httpLabItem.update({
      where: { id },
      data,
    });
  },

  async deleteMethodsUser(id) {
    return prisma.httpLabItem.delete({
      where: { id },
    });
  },

  async getHttpUsers() {
    return prisma.httpLabUser.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async createHttpUser(data) {
    return prisma.httpLabUser.create({
      data,
    });
  },

  async getHttpUserById(id) {
    return prisma.httpLabUser.findUnique({
      where: { id },
    });
  },

  async updateHttpUser(id, data) {
    return prisma.httpLabUser.update({
      where: { id },
      data,
    });
  },

  async deleteHttpUser(id) {
    return prisma.httpLabUser.delete({
      where: { id },
    });
  },
};
