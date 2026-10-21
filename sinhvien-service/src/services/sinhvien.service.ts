
import { sinhvienRepository } from "../repositories/sinhvien.repository";


type CreateSinhVienInput = {
  ma_sv: string;
  ho_ten: string;
  ngay_sinh?: string | null;
  gioi_tinh?: string | null;
  email?: string | null;
  so_dien_thoai?: string | null;
  lop: string;
};

function validateCreateInput(body: unknown): CreateSinhVienInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw Object.assign(new Error("Dữ liệu gửi lên không hợp lệ"), {
      statusCode: 400,
    });
  }

  const data = body as Record<string, unknown>;

  for (const field of ["ma_sv", "ho_ten", "lop"] as const) {
    if (
      typeof data[field] !== "string" ||
      data[field].trim().length === 0
    ) {
      throw Object.assign(new Error(`Trường ${field} là bắt buộc`), {
        statusCode: 400,
      });
    }
  }

  for (const field of ["email", "so_dien_thoai", "gioi_tinh"] as const) {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      typeof data[field] !== "string"
    ) {
      throw Object.assign(new Error(`Trường ${field} phải là chuỗi`), {
        statusCode: 400,
      });
    }
  }

  let ngay_sinh: string | null | undefined;

  if (data.ngay_sinh === null) {
    ngay_sinh = null;
  } else if (data.ngay_sinh !== undefined) {
    if (
      typeof data.ngay_sinh !== "string" ||
      Number.isNaN(Date.parse(data.ngay_sinh))
    ) {
      throw Object.assign(new Error("ngay_sinh không hợp lệ"), {
        statusCode: 400,
      });
    }

    ngay_sinh = new Date(data.ngay_sinh).toISOString();
  }

  return {
    ma_sv: (data.ma_sv as string).trim(),
    ho_ten: (data.ho_ten as string).trim(),
    lop: (data.lop as string).trim(),
    ngay_sinh,
    gioi_tinh: data.gioi_tinh as string | null | undefined,
    email: data.email as string | null | undefined,
    so_dien_thoai: data.so_dien_thoai as string | null | undefined,
  };
}


function validateUpdateInput(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw Object.assign(new Error("Dữ liệu gửi lên không hợp lệ"), {
      statusCode: 400,
    });
  }

  const data = body as Record<string, unknown>;
  const allowedFields = [
    "ho_ten",
    "ngay_sinh",
    "gioi_tinh",
    "email",
    "so_dien_thoai",
    "lop",
  ];

  const keys = Object.keys(data);

  if (keys.length === 0) {
    throw Object.assign(new Error("Phải cung cấp ít nhất một trường cần cập nhật"), {
      statusCode: 400,
    });
  }

  for (const key of keys) {
    if (!allowedFields.includes(key)) {
      throw Object.assign(new Error(`Không được cập nhật trường ${key}`), {
        statusCode: 400,
      });
    }
  }

  for (const field of ["ho_ten", "lop"] as const) {
    if (
      data[field] !== undefined &&
      (typeof data[field] !== "string" || !data[field].trim())
    ) {
      throw Object.assign(new Error(`Trường ${field} không hợp lệ`), {
        statusCode: 400,
      });
    }
  }

  for (const field of ["email", "so_dien_thoai", "gioi_tinh"] as const) {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      typeof data[field] !== "string"
    ) {
      throw Object.assign(new Error(`Trường ${field} phải là chuỗi`), {
        statusCode: 400,
      });
    }
  }

  let ngay_sinh: Date | null | undefined;

  if (data.ngay_sinh === null) {
    ngay_sinh = null;
  } else if (data.ngay_sinh !== undefined) {
    if (
      typeof data.ngay_sinh !== "string" ||
      Number.isNaN(Date.parse(data.ngay_sinh))
    ) {
      throw Object.assign(new Error("ngay_sinh không hợp lệ"), {
        statusCode: 400,
      });
    }

    ngay_sinh = new Date(data.ngay_sinh);
  }

  return {
    ...(data.ho_ten !== undefined && {
      ho_ten: (data.ho_ten as string).trim(),
    }),
    ...(data.lop !== undefined && {
      lop: (data.lop as string).trim(),
    }),
    ...(data.ngay_sinh !== undefined && { ngay_sinh }),
    ...(data.gioi_tinh !== undefined && {
      gioi_tinh: data.gioi_tinh as string | null,
    }),
    ...(data.email !== undefined && {
      email: data.email as string | null,
    }),
    ...(data.so_dien_thoai !== undefined && {
      so_dien_thoai: data.so_dien_thoai as string | null,
    }),
  };
}

export const sinhvienService = {
  findAll() {
    return sinhvienRepository.findAll();
  },

  async findById(ma_sv: string) {
    const sinhvien = await sinhvienRepository.findById(ma_sv);

    if (!sinhvien) {
      throw Object.assign(new Error("Không tìm thấy sinh viên"), {
        statusCode: 404,
      });
    }

    return sinhvien;
  },

  create(body: unknown) {
  const data = validateCreateInput(body);

  return sinhvienRepository.create({
    ...data,
    ngay_sinh:
      data.ngay_sinh === undefined
        ? undefined
        : data.ngay_sinh === null
          ? null
          : new Date(data.ngay_sinh),
  });
},

  async update(ma_sv: string, body: unknown) {
    const data = validateUpdateInput(body);

    await this.findById(ma_sv);

    return sinhvienRepository.update(ma_sv, data);
  },

  async delete(ma_sv: string) {
    await this.findById(ma_sv);
    return sinhvienRepository.delete(ma_sv);
  },
};
