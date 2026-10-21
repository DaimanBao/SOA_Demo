
import { dangkyRepository } from "../repositories/dangky.repository";

const sinhvienUrl = process.env.SINHVIEN_SERVICE_URL;
const detaiUrl = process.env.DETAI_SERVICE_URL;

function httpError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

function parseRegistrationDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw httpError("ngay_dang_ky không hợp lệ", 400);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw httpError("ngay_dang_ky không hợp lệ", 400);
  }

  return date;
}

async function getRemoteData(
  url: string,
  label: string,
  token: string,
) {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw httpError(`${label} Service không khả dụng`, 503);
  }

  if (response.status === 404) {
    throw httpError(`${label} không tồn tại`, 400);
  }

  if (!response.ok) {
    throw httpError(`Không thể kiểm tra ${label}`, 503);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export const dangkyService = {
  
  async findAll(ma_sv?: string | null) {
    const registrations = await dangkyRepository.findAll();

    // undefined nghĩa là ADMIN được xem tất cả
    if (ma_sv === undefined) {
      return registrations;
    }

    if (!ma_sv) {
      throw httpError("Tài khoản chưa liên kết mã sinh viên", 403);
    }

    return registrations.filter(
      (item) => item.ma_sv === ma_sv,
    );
  },

  async findById(ma_dk: number, ma_sv?: string | null) {
    const dangky = await dangkyRepository.findById(ma_dk);

    if (!dangky) {
      throw httpError("Không tìm thấy đăng ký", 404);
    }

    // ADMIN không bị giới hạn theo mã sinh viên
    if (ma_sv === undefined) {
      return dangky;
    }

    // STUDENT chỉ xem được đăng ký của chính mình
    if (!ma_sv || dangky.ma_sv !== ma_sv) {
      throw httpError("Không tìm thấy đăng ký", 404);
    }

    return dangky;
  },
  
  async create(
    ma_sv: string,
    ma_dt: string,
    token: string,
    requestedDate?: unknown,
  ) {
    const ngay_dang_ky = parseRegistrationDate(requestedDate);

    if (!ma_sv?.trim() || !ma_dt?.trim()) {
      throw httpError("ma_sv và ma_dt là bắt buộc", 400);
    }

    const existingRegistration =
      await dangkyRepository.findByStudentAndTopic(ma_sv, ma_dt);

    if (existingRegistration) {
      throw httpError(
        "Sinh viên đã có đăng ký cho đề tài này. Vui lòng kiểm tra danh sách đăng ký hoặc chọn đề tài khác.",
        409,
      );
    }

    if (!sinhvienUrl || !detaiUrl) {
      throw httpError("Thiếu cấu hình URL của các Service", 500);
    }

    // Kiểm tra sinh viên tồn tại
    await getRemoteData(
      `${sinhvienUrl}/api/sinhvien/${encodeURIComponent(ma_sv)}`,
      "Sinh viên",
      token
    );

    // Kiểm tra đề tài tồn tại và đang mở
    const detai = await getRemoteData(
      `${detaiUrl}/api/detai/${encodeURIComponent(ma_dt)}`,
      "Đề tài",
      token
    );

    if (detai.trang_thai !== "DANG_MO") {
      throw httpError("Đề tài không còn mở đăng ký", 409);
    }

    const soLuong = Number(detai.so_luong_sv);

    if (!Number.isInteger(soLuong) || soLuong < 1) {
      throw httpError("Số lượng sinh viên của đề tài không hợp lệ", 502);
    }

    const currentCount = await dangkyRepository.countByDetai(ma_dt);

    if (currentCount >= soLuong) {
      throw httpError("Đề tài đã đủ số lượng sinh viên", 409);
    }

    return dangkyRepository.create({
      ma_sv,
      ma_dt,
      ...(ngay_dang_ky && { ngay_dang_ky }),
    });
  },

  async update(
    ma_dk: number,
    data: { trang_thai?: string; diem?: number | null },
  ) {
    if (!Number.isInteger(ma_dk) || ma_dk < 1) {
      throw httpError("ma_dk không hợp lệ", 400);
    }

    if (Object.keys(data).length === 0) {
      throw httpError("Không có dữ liệu cần cập nhật", 400);
    }

    if (
      data.trang_thai !== undefined &&
      !["DA_DANG_KY", "DA_HUY", "HOAN_THANH"].includes(data.trang_thai)
    ) {
      throw httpError("trang_thai không hợp lệ", 400);
    }

    if (
      data.diem !== undefined &&
      data.diem !== null &&
      (!Number.isFinite(data.diem) || data.diem < 0 || data.diem > 10)
    ) {
      throw httpError("Điểm phải nằm trong khoảng 0 đến 10", 400);
    }

    await this.findById(ma_dk);
    return dangkyRepository.update(ma_dk, data);
  },

  async delete(ma_dk: number) {
    await this.findById(ma_dk);
    return dangkyRepository.delete(ma_dk);
  },
};
