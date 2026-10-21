
import { prisma } from "../lib/prisma";

export const detaiRepository = {
  findAll() {
    return prisma.detai.findMany({
      orderBy: { ma_dt: "asc" },
    });
  },

  findById(ma_dt: string) {
    return prisma.detai.findUnique({
      where: { ma_dt },
    });
  },

  create(data: {
    ma_dt: string;
    ten_dt: string;
    giang_vien: string;
    so_luong_sv?: number;
    trang_thai?: string;
  }) {
    return prisma.detai.create({ data });
  },

  update(
    ma_dt: string,
    data: {
      ten_dt?: string;
      giang_vien?: string;
      so_luong_sv?: number;
      trang_thai?: string;
    },
  ) {
    return prisma.detai.update({
      where: { ma_dt },
      data,
    });
  },

  delete(ma_dt: string) {
    return prisma.detai.delete({
      where: { ma_dt },
    });
  },
};
