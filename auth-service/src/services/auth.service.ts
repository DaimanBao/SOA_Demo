
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { authRepository } from "../repositories/auth.repository";

function httpError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Thiếu JWT_SECRET trong file .env");
}

function createToken(user: {
  id: number;
  username: string;
  role: string;
  ma_sv: string | null;
  must_change_password: boolean;
}) {
  const options: SignOptions = {
    expiresIn: 7200, // 2 giờ
  };

  return jwt.sign(
    {
      sub: String(user.id),
      username: user.username,
      role: user.role,
      ma_sv: user.ma_sv,
      must_change_password: user.must_change_password,
    },
    JWT_SECRET!,
    options,
  );
}

function getDefaultStudentPassword(ma_sv: string, ho_ten: string) {
  const password = `${ma_sv}${ho_ten}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (!password || password.length > 120) {
    throw httpError("Không thể tạo thông tin đăng nhập từ mã và họ tên sinh viên", 422);
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw httpError(
      "Mã và họ tên tạo mật khẩu quá dài; hãy rút gọn tên trong hồ sơ trước.",
      422,
    );
  }

  return password;
}

export const authService = {
  async bootstrapAdmin(
    username: unknown,
    password: unknown,
    suppliedSecret: string | undefined,
  ) {
    const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

    if (!bootstrapSecret || bootstrapSecret.length < 32) {
      throw httpError(
        "ADMIN_BOOTSTRAP_SECRET chưa được cấu hình hoặc không đủ mạnh",
        503,
      );
    }

    if (
      !suppliedSecret ||
      Buffer.byteLength(suppliedSecret) !== Buffer.byteLength(bootstrapSecret) ||
      !timingSafeEqual(
        Buffer.from(suppliedSecret),
        Buffer.from(bootstrapSecret),
      )
    ) {
      throw httpError("Secret bootstrap không hợp lệ", 403);
    }

    if (
      typeof username !== "string" ||
      !username.trim() ||
      username.trim().length > 120
    ) {
      throw httpError("Username phải có từ 1 đến 120 ký tự", 400);
    }

    if (
      typeof password !== "string" ||
      password.length < 12 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      throw httpError("Mật khẩu phải có ít nhất 12 ký tự và không quá 72 byte", 400);
    }

    try {
      const user = await authRepository.createFirstAdmin({
        username: username.trim(),
        password_hash: await bcrypt.hash(password, 12),
      });

      if (!user) {
        throw httpError("ADMIN đã tồn tại; bootstrap chỉ dùng để tạo ADMIN đầu tiên", 409);
      }

      return {
        id: user.id,
        username: user.username,
        role: user.role,
      };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2034"
      ) {
        throw httpError("ADMIN đã được tạo; bootstrap chỉ dùng một lần", 409);
      }

      throw error;
    }
  },

  async provisionStudentAccount(ma_sv: unknown, token: string) {
    const payload = this.verifyToken(token);

    if (
      typeof payload === "string" ||
      payload.role !== "ADMIN"
    ) {
      throw httpError("Chỉ ADMIN được cấp tài khoản sinh viên", 403);
    }

    if (typeof ma_sv !== "string" || !ma_sv.trim()) {
      throw httpError("Mã sinh viên không hợp lệ", 400);
    }

    const existingUser = await authRepository.findByMaSv(ma_sv.trim());

    if (existingUser) {
      return {
        created: false,
        username: existingUser.username,
      };
    }

    const sinhvienServiceUrl = process.env.SINHVIEN_SERVICE_URL;

    if (!sinhvienServiceUrl) {
      throw httpError("Thiếu cấu hình SINHVIEN_SERVICE_URL", 500);
    }

    let response: Response;

    try {
      response = await fetch(
        `${sinhvienServiceUrl.replace(/\/+$/, "")}/api/sinhvien/${encodeURIComponent(ma_sv.trim())}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      throw httpError("SinhVien Service không khả dụng", 503);
    }

    if (response.status === 404) {
      throw httpError("Mã sinh viên không tồn tại", 404);
    }

    if (!response.ok) {
      throw httpError("Không thể xác minh hồ sơ sinh viên", 503);
    }

    const student = await response.json() as {
      ma_sv?: unknown;
      ho_ten?: unknown;
    };

    if (
      student.ma_sv !== ma_sv.trim() ||
      typeof student.ho_ten !== "string" ||
      !student.ho_ten.trim()
    ) {
      throw httpError("Hồ sơ sinh viên thiếu mã hoặc họ tên hợp lệ", 422);
    }

    const username = getDefaultStudentPassword(ma_sv.trim(), student.ho_ten);

    const existingUsername = await authRepository.findByUsername(username);

    if (existingUsername) {
      throw httpError(
        "Tên đăng nhập tự tạo đã được sử dụng. Hãy điều chỉnh mã hoặc họ tên sinh viên.",
        409,
      );
    }

    const password_hash = await bcrypt.hash(username, 12);
    const user = await authRepository.create({
      username,
      password_hash,
      role: "STUDENT",
      ma_sv: ma_sv.trim(),
      must_change_password: true,
    });

    return {
      created: true,
      username: user.username,
      initial_password: username,
    };
  },

  async resetStudentPassword(ma_sv: unknown, token: string) {
    const payload = this.verifyToken(token);

    if (
      typeof payload === "string" ||
      payload.role !== "ADMIN"
    ) {
      throw httpError("Chỉ ADMIN được đặt lại mật khẩu sinh viên", 403);
    }

    if (typeof ma_sv !== "string" || !ma_sv.trim()) {
      throw httpError("Mã sinh viên không hợp lệ", 400);
    }

    const studentId = ma_sv.trim();
    const user = await authRepository.findByMaSv(studentId);

    if (!user) {
      throw httpError("Sinh viên chưa có tài khoản để đặt lại mật khẩu", 404);
    }

    const sinhvienServiceUrl = process.env.SINHVIEN_SERVICE_URL;

    if (!sinhvienServiceUrl) {
      throw httpError("Thiếu cấu hình SINHVIEN_SERVICE_URL", 500);
    }

    let response: Response;

    try {
      response = await fetch(
        `${sinhvienServiceUrl.replace(/\/+$/, "")}/api/sinhvien/${encodeURIComponent(studentId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      throw httpError("SinhVien Service không khả dụng", 503);
    }

    if (response.status === 404) {
      throw httpError("Mã sinh viên không tồn tại", 404);
    }

    if (!response.ok) {
      throw httpError("Không thể xác minh hồ sơ sinh viên", 503);
    }

    const student = await response.json() as {
      ma_sv?: unknown;
      ho_ten?: unknown;
    };

    if (
      student.ma_sv !== studentId ||
      typeof student.ho_ten !== "string" ||
      !student.ho_ten.trim()
    ) {
      throw httpError("Hồ sơ sinh viên thiếu mã hoặc họ tên hợp lệ", 422);
    }

    const temporaryPassword = getDefaultStudentPassword(
      studentId,
      student.ho_ten,
    );
    const updatedUser = await authRepository.updatePassword(user.id, {
      password_hash: await bcrypt.hash(temporaryPassword, 12),
      must_change_password: true,
    });

    return {
      username: updatedUser.username,
      temporary_password: temporaryPassword,
    };
  },

  async login(username: string, password: string) {
    if (typeof username !== "string" || typeof password !== "string") {
      throw httpError("Username hoặc mật khẩu không hợp lệ", 400);
    }

    const user = await authRepository.findByUsername(username);

    if (!user) {
      throw httpError("Sai tài khoản hoặc mật khẩu", 401);
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!validPassword) {
      throw httpError("Sai tài khoản hoặc mật khẩu", 401);
    }

    return {
      access_token: createToken(user),
      token_type: "Bearer",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        ma_sv: user.ma_sv,
        must_change_password: user.must_change_password,
      },
    };
  },

  async changePassword(
    token: string,
    currentPassword: unknown,
    newPassword: unknown,
  ) {
    const payload = this.verifyToken(token);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !/^\d+$/.test(payload.sub)
    ) {
      throw httpError("Token không hợp lệ", 401);
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      throw httpError("Vui lòng nhập mật khẩu hiện tại và mật khẩu mới", 400);
    }

    if (newPassword.length < 8) {
      throw httpError("Mật khẩu mới phải có ít nhất 8 ký tự", 400);
    }

    if (Buffer.byteLength(newPassword, "utf8") > 72) {
      throw httpError("Mật khẩu mới không được vượt quá 72 byte", 400);
    }

    const user = await authRepository.findById(Number(payload.sub));

    if (!user) {
      throw httpError("Tài khoản không tồn tại", 404);
    }

    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
      throw httpError("Mật khẩu hiện tại không chính xác", 400);
    }

    const updatedUser = await authRepository.updatePassword(user.id, {
      password_hash: await bcrypt.hash(newPassword, 12),
      must_change_password: false,
    });

    return {
      access_token: createToken(updatedUser),
      token_type: "Bearer",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        ma_sv: updatedUser.ma_sv,
        must_change_password: updatedUser.must_change_password,
      },
    };
  },

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET!);
    } catch {
      throw httpError("Token không hợp lệ hoặc đã hết hạn", 401);
    }
  },
};
