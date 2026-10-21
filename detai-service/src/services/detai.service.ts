
import { detaiRepository } from "../repositories/detai.repository";

function validateCreate(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw Object.assign(new Error("Dữ liệu không hợp lệ"), {
      statusCode: 400,
    });
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.ma_dt !== "string" ||
    !data.ma_dt.trim() ||
    typeof data.ten_dt !== "string" ||
    !data.ten_dt.trim() ||
    typeof data.giang_vien !== "string" ||
    !data.giang_vien.trim()
  ) {
    throw Object.assign(
      new Error("ma_dt, ten_dt và giang_vien là bắt buộc"),
      { statusCode: 400 },
    );
  }

  if (
    data.so_luong_sv !== undefined &&
    (!Number.isInteger(data.so_luong_sv) ||
      (data.so_luong_sv as number) <= 0)
  ) {
    throw Object.assign(new Error("so_luong_sv phải là số nguyên dương"), {
      statusCode: 400,
    });
  }

  const allowedStatuses = ["DANG_MO", "DA_DU", "DA_DONG"];

  if (
    data.trang_thai !== undefined &&
    (typeof data.trang_thai !== "string" ||
      !allowedStatuses.includes(data.trang_thai))
  ) {
    throw Object.assign(new Error("trang_thai không hợp lệ"), {
      statusCode: 400,
    });
  }

  return {
    ma_dt: data.ma_dt.trim(),
    ten_dt: data.ten_dt.trim(),
    giang_vien: data.giang_vien.trim(),
    ...(data.so_luong_sv !== undefined && {
      so_luong_sv: data.so_luong_sv as number,
    }),
    ...(data.trang_thai !== undefined && {
      trang_thai: data.trang_thai as string,
    }),
  };
}

function validateUpdate(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw Object.assign(new Error("Dữ liệu không hợp lệ"), {
      statusCode: 400,
    });
  }

  const data = body as Record<string, unknown>;
  const allowedFields = [
    "ten_dt",
    "giang_vien",
    "so_luong_sv",
    "trang_thai",
  ];

  const keys = Object.keys(data);

  if (
    keys.length === 0 ||
    keys.some((key) => !allowedFields.includes(key))
  ) {
    throw Object.assign(new Error("Dữ liệu cập nhật không hợp lệ"), {
      statusCode: 400,
    });
  }

  if (
    ("ten_dt" in data &&
      (typeof data.ten_dt !== "string" || !data.ten_dt.trim())) ||
    ("giang_vien" in data &&
      (typeof data.giang_vien !== "string" ||
        !data.giang_vien.trim()))
  ) {
    throw Object.assign(new Error("Tên đề tài hoặc giảng viên không hợp lệ"), {
      statusCode: 400,
    });
  }

  if (
    "so_luong_sv" in data &&
    (!Number.isInteger(data.so_luong_sv) ||
      (data.so_luong_sv as number) <= 0)
  ) {
    throw Object.assign(new Error("so_luong_sv phải là số nguyên dương"), {
      statusCode: 400,
    });
  }

  if (
    "trang_thai" in data &&
    (typeof data.trang_thai !== "string" ||
      !["DANG_MO", "DA_DU", "DA_DONG"].includes(data.trang_thai))
  ) {
    throw Object.assign(new Error("trang_thai không hợp lệ"), {
      statusCode: 400,
    });
  }

  return {
    ...(data.ten_dt !== undefined && {
      ten_dt: (data.ten_dt as string).trim(),
    }),
    ...(data.giang_vien !== undefined && {
      giang_vien: (data.giang_vien as string).trim(),
    }),
    ...(data.so_luong_sv !== undefined && {
      so_luong_sv: data.so_luong_sv as number,
    }),
    ...(data.trang_thai !== undefined && {
      trang_thai: data.trang_thai as string,
    }),
  };
}

export const detaiService = {
  findAll() {
    return detaiRepository.findAll();
  },

  async findById(ma_dt: string) {
    const detai = await detaiRepository.findById(ma_dt);

    if (!detai) {
      throw Object.assign(new Error("Không tìm thấy đề tài"), {
        statusCode: 404,
      });
    }

    return detai;
  },

  create(body: unknown) {
    return detaiRepository.create(validateCreate(body));
  },

  async update(ma_dt: string, body: unknown) {
    const data = validateUpdate(body);
    await this.findById(ma_dt);
    return detaiRepository.update(ma_dt, data);
  },

  async delete(ma_dt: string) {
    await this.findById(ma_dt);
    return detaiRepository.delete(ma_dt);
  },
};
