
import { prisma } from "../lib/prisma";

export const authRepository = {
  createFirstAdmin(data: {
    username: string;
    password_hash: string;
  }) {
    return prisma.$transaction(
      async (transaction) => {
        const adminCount = await transaction.users.count({
          where: { role: "ADMIN" },
        });

        if (adminCount > 0) {
          return null;
        }

        return transaction.users.create({
          data: {
            ...data,
            role: "ADMIN",
            ma_sv: null,
            must_change_password: false,
          },
        });
      },
      { isolationLevel: "Serializable" },
    );
  },

  findByUsername(username: string) {
    return prisma.users.findUnique({
      where: { username },
    });
  },

  findByMaSv(ma_sv: string) {
    return prisma.users.findUnique({
      where: { ma_sv },
    });
  },

  findById(id: number) {
    return prisma.users.findUnique({
      where: { id },
    });
  },

  create(data: {
    username: string;
    password_hash: string;
    role: string;
    ma_sv: string | null;
    must_change_password?: boolean;
  }) {
    return prisma.users.create({ data });
  },

  updatePassword(
    id: number,
    data: { password_hash: string; must_change_password: boolean },
  ) {
    return prisma.users.update({
      where: { id },
      data,
    });
  },
};
