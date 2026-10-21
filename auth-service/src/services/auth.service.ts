
import bcrypt from "bcryptjs";
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
    },
    JWT_SECRET!,
    options,
  );
}

export const authService = {
  async register(data: {
    username: string;
    password: string;
    ma_sv: string;
  }) {
    const { username, password, ma_sv } = data;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof ma_sv !== "string" ||
      !username.trim() ||
      !password ||
      !ma_sv.trim()
    ) {
      throw httpError("Thiếu username, password hoặc ma_sv", 400);
    }

    if (username.length > 50 || ma_sv.length > 20) {
      throw httpError("Username hoặc ma_sv vượt quá độ dài cho phép", 400);
    }

    if (password.length < 8) {
      throw httpError("Mật khẩu phải có ít nhất 8 ký tự", 400);
    }

    const existingUser = await authRepository.findByUsername(username);

    if (existingUser) {
      throw httpError("Username đã tồn tại", 409);
    }

    // Kiểm tra sinh viên tồn tại trước khi cấp tài khoản
    let response: Response;

    try {
      response = await fetch(
        `${process.env.SINHVIEN_SERVICE_URL}/api/sinhvien/${encodeURIComponent(ma_sv)}`,
      );
    } catch {
      throw httpError("SinhVien Service không khả dụng", 503);
    }

    if (response.status === 404) {
      throw httpError("Mã sinh viên không tồn tại", 400);
    }

    if (!response.ok) {
      throw httpError("Không thể xác minh sinh viên", 503);
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await authRepository.create({
      username,
      password_hash,
      role: "STUDENT",
      ma_sv,
    });

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      ma_sv: user.ma_sv,
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
