
import { prisma } from "../lib/prisma";

export const dangkyRepository = {
  findAll() {
    return prisma.dangky.findMany({
      orderBy: { ma_dk: "asc" },
    });
  },

  findById(ma_dk: number) {
    return prisma.dangky.findUnique({
      where: { ma_dk },
    });
  },

  countByDetai(ma_dt: string) {
    return prisma.dangky.count({
      where: {
        ma_dt,
        trang_thai: "DA_DANG_KY",
      },
    });
  },

  create(data: { ma_sv: string; ma_dt: string }) {
    return prisma.dangky.create({ data });
  },

  update(
    ma_dk: number,
    data: { trang_thai?: string; diem?: number | null },
  ) {
    return prisma.dangky.update({
      where: { ma_dk },
      data,
    });
  },

  delete(ma_dk: number) {
    return prisma.dangky.delete({
      where: { ma_dk },
    });
  },
};
