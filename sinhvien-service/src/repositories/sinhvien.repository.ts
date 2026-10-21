
import { prisma } from "../lib/prisma";

export const sinhvienRepository = {
  findAll() {
    return prisma.sinhvien.findMany({
      orderBy: { ma_sv: "asc" },
    });
  },

  findById(ma_sv: string) {
    return prisma.sinhvien.findUnique({
      where: { ma_sv },
    });
  },

  create(data: {
    ma_sv: string;
    ho_ten: string;
    ngay_sinh?: Date | null;
    gioi_tinh?: string | null;
    email?: string | null;
    so_dien_thoai?: string | null;
    lop: string;
  }) {
    return prisma.sinhvien.create({ data });
  },

  update(
    ma_sv: string,
    data: {
      ho_ten?: string;
      ngay_sinh?: Date | null;
      gioi_tinh?: string | null;
      email?: string | null;
      so_dien_thoai?: string | null;
      lop?: string;
    },
  ) {
    return prisma.sinhvien.update({
      where: { ma_sv },
      data,
    });
  },

  delete(ma_sv: string) {
    return prisma.sinhvien.delete({
      where: { ma_sv },
    });
  },
};
