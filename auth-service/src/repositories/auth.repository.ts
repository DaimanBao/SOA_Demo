
import { prisma } from "../lib/prisma";

export const authRepository = {
  findByUsername(username: string) {
    return prisma.users.findUnique({
      where: { username },
    });
  },

  create(data: {
    username: string;
    password_hash: string;
    role: string;
    ma_sv: string | null;
  }) {
    return prisma.users.create({ data });
  },
};
