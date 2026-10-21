
import { prisma } from "../lib/prisma";

export const authRepository = {
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
