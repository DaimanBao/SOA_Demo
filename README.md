# SOA Demo — Hệ thống quản lý đồ án tốt nghiệp

Ứng dụng demo quản lý hồ sơ sinh viên, đề tài, đăng ký đề tài và tài khoản người dùng theo kiến trúc microservice.

> **Phạm vi hướng dẫn:** Các lệnh trong README dùng Windows PowerShell. PostgreSQL chạy trên máy host; các backend và API Gateway chạy bằng Docker Compose; Angular frontend chạy trực tiếp trên máy host.

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Yêu cầu môi trường](#2-yêu-cầu-môi-trường)
3. [Cài đặt lần đầu](#3-cài-đặt-lần-đầu)
   - [Tạo database](#31-tạo-bốn-database)
   - [Nạp dữ liệu mẫu tùy chọn](#32-nạp-dữ-liệu-mẫu-tùy-chọn)
   - [Tạo file môi trường](#33-tạo-và-cấu-hình-file-env)
4. [Khởi động hệ thống](#4-khởi-động-hệ-thống)
5. [Tạo ADMIN đầu tiên bằng Postman](#5-tạo-admin-đầu-tiên-bằng-postman)
6. [Đăng nhập và cấp tài khoản sinh viên](#6-đăng-nhập-và-cấp-tài-khoản-sinh-viên)
7. [Các lệnh Docker thường dùng](#7-các-lệnh-docker-thường-dùng)
8. [Địa chỉ và cổng dịch vụ](#8-địa-chỉ-và-cổng-dịch-vụ)
9. [Khắc phục sự cố](#9-khắc-phục-sự-cố)
10. [Lưu ý bảo mật](#10-lưu-ý-bảo-mật)

---

## 1. Tổng quan hệ thống

| Thành phần | Vai trò | Cách chạy |
|---|---|---|
| `api-gateway` | Cổng API cho frontend; xác thực JWT và chuyển request đến service phù hợp | Docker Compose |
| `auth-service` | Đăng nhập, xác minh JWT, đổi mật khẩu, cấp và reset tài khoản sinh viên | Docker Compose |
| `sinhvien-service` | Quản lý hồ sơ sinh viên | Docker Compose |
| `detai-service` | Quản lý đề tài | Docker Compose |
| `dangky-service` | Quản lý đăng ký đề tài | Docker Compose |
| `frontend-app` | Giao diện Angular cho ADMIN và STUDENT | Chạy trên máy host |
| PostgreSQL | Lưu dữ liệu; mỗi service nghiệp vụ/auth có database riêng | Chạy trên máy host |

Luồng request thông thường:

```text
Trình duyệt (localhost:4200)
        |
        v
API Gateway (localhost:3000) -- JWT --> Auth / SinhVien / DeTai / DangKy
                                             |
                                             v
                                        PostgreSQL
```

Frontend chỉ gọi API Gateway. Các backend không dùng chung database: mỗi service kết nối tới database riêng của nó.

---

## 2. Yêu cầu môi trường

Cài đặt và khởi động:

- Git.
- Docker Desktop.
- PostgreSQL và PostgreSQL client tools (`createdb`, `pg_restore`).
- Node.js LTS và npm để chạy frontend.

Mặc định PostgreSQL được cấu hình lắng nghe ở `localhost:5433`. Có thể dùng cổng khác, nhưng cần cập nhật cổng trong `DATABASE_URL` của tất cả service.

---

## 3. Cài đặt lần đầu

Thực hiện các bước dưới đây từ thư mục gốc repository trong PowerShell, trừ khi có ghi chú khác.

### 3.1 Tạo bốn database

Tạo database rỗng cho từng service. Thay `postgres` bằng tài khoản PostgreSQL của bạn nếu cần:

```powershell
createdb -h localhost -p 5433 -U postgres auth_db
createdb -h localhost -p 5433 -U postgres sinhvien_db
createdb -h localhost -p 5433 -U postgres detai_db
createdb -h localhost -p 5433 -U postgres dangky_db
```

Nếu database đã tồn tại và có dữ liệu cần giữ, **không tạo lại hoặc restore đè lên database đó**.

### 3.2 Khởi tạo schema và nạp dữ liệu mẫu

Ứng dụng cần có các bảng trước khi chạy. Cách đơn giản nhất là restore backup trong thư mục `database`; đây là PostgreSQL custom-format backups (dù tên file có đuôi `.sql`) và bao gồm schema cùng dữ liệu mẫu. Restore vào các database mới, rỗng:

```powershell
pg_restore --no-owner --no-privileges -h localhost -p 5433 -U postgres -d auth_db .\database\auth_db.sql
pg_restore --no-owner --no-privileges -h localhost -p 5433 -U postgres -d sinhvien_db .\database\sinhvien.sql
pg_restore --no-owner --no-privileges -h localhost -p 5433 -U postgres -d detai_db .\database\detai_db.sql
pg_restore --no-owner --no-privileges -h localhost -p 5433 -U postgres -d dangky_db .\database\dangky_db.sql
```

> **Cảnh báo:** Chỉ restore vào database rỗng. Backup có thể bao gồm dữ liệu tài khoản và dữ liệu cá nhân; chỉ sử dụng hoặc chia sẻ nếu bạn được phép. Nếu không muốn dùng dữ liệu mẫu, vẫn phải khởi tạo schema cho cả bốn database bằng quy trình migration/khởi tạo phù hợp trước khi chạy ứng dụng; chỉ tạo database rỗng là chưa đủ.

### 3.3 Tạo và cấu hình file `.env`

Các file `.env` thật không được commit. Tạo chúng từ file mẫu:

```powershell
Copy-Item .\auth-service\.env.example .\auth-service\.env
Copy-Item .\sinhvien-service\.env.example .\sinhvien-service\.env
Copy-Item .\detai-service\.env.example .\detai-service\.env
Copy-Item .\dangky-service\.env.example .\dangky-service\.env
Copy-Item .\api-gateway\.env.example .\api-gateway\.env
```

Mở các file `.env` vừa tạo và cập nhật:

1. **Thông tin PostgreSQL:** Trong từng service, sửa username, password, host, port và tên database ở `DATABASE_URL`. Database tương ứng là `auth_db`, `sinhvien_db`, `detai_db` hoặc `dangky_db`.
2. **JWT secret:** Tạo một secret ngẫu nhiên đủ mạnh:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Đặt cùng giá trị `JWT_SECRET` trong cả năm file `.env` (bốn backend và API Gateway). Không dùng nguyên giá trị mẫu.
3. **Bootstrap secret:** Tạo một secret ngẫu nhiên **khác** JWT secret bằng lệnh trên. Đặt vào `ADMIN_BOOTSTRAP_SECRET` trong `auth-service/.env`. Secret này chỉ dùng một lần để tạo ADMIN đầu tiên; hướng dẫn đầy đủ ở [phần 5](#5-tạo-admin-đầu-tiên-bằng-postman).

Nếu mật khẩu PostgreSQL có ký tự đặc biệt trong URL, ví dụ `@`, `:`, `/`, `#` hoặc `%`, hãy URL-encode mật khẩu đó.

Các URL liên service trong file mẫu dùng `localhost` cho trường hợp chạy service trực tiếp trên host. Khi chạy Docker Compose, Compose sẽ thay chúng bằng hostname nội bộ của container. Script `scripts/dev.ps1` cũng tự đổi hostname PostgreSQL sang `host.docker.internal` khi gọi Compose; không cần sửa file `.env` để làm việc này.

---

## 4. Khởi động hệ thống

### 4.1 Kiểm tra cấu hình và chạy backend

Đảm bảo Docker Desktop và PostgreSQL đang chạy, sau đó tại thư mục gốc repository:

```powershell
.\scripts\dev.ps1 check
.\scripts\dev.ps1 up
```

Lệnh `check` kiểm tra cấu hình Compose. Lệnh `up` build nếu cần và chạy các backend cùng API Gateway ở chế độ nền. PostgreSQL không nằm trong Compose: script không tạo, migrate hoặc xóa database host.

Kiểm tra container đã sẵn sàng:

```powershell
.\scripts\dev.ps1 status
```

### 4.2 Cài đặt và chạy frontend

Mở một cửa sổ PowerShell khác:

```powershell
Set-Location .\frontend-app
npm install
npm start
```

Mở `http://localhost:4200` trong trình duyệt. Frontend gửi request tới API Gateway tại `http://localhost:3000`.

---

## 5. Tạo ADMIN đầu tiên bằng Postman

### Khi nào cần dùng?

Dùng quy trình này khi `auth_db` chưa có tài khoản ADMIN. Bootstrap **không cần JWT** vì chưa có ADMIN để đăng nhập lấy JWT. Thay vào đó, request phải cung cấp `ADMIN_BOOTSTRAP_SECRET` đã cấu hình trong `auth-service/.env`.

Nếu bạn đã restore dữ liệu mẫu, có thể database đã có tài khoản. Hãy thử đăng nhập bằng tài khoản mẫu/đã có trước; bootstrap chỉ tạo ADMIN nếu chưa tồn tại ADMIN nào.

### Bước 1: Cấu hình bootstrap secret

Tạo secret ngẫu nhiên riêng dài tối thiểu 32 ký tự:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Thêm kết quả vào `auth-service/.env`:

```dotenv
ADMIN_BOOTSTRAP_SECRET=dan_gia_tri_ngau_nhien_vua_tao_vao_day
```

Không dùng nguyên chuỗi minh họa. Sau khi sửa `.env`, tạo lại auth-service để nạp cấu hình mới:

```powershell
.\scripts\dev.ps1 restart auth-service
```

### Bước 2: Tạo request trong Postman

Tạo request với thông tin sau:

| Trường | Giá trị |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/admin/bootstrap` |
| Body | `raw` → chọn `JSON` |

Thêm các header:

| Key | Value |
|---|---|
| `Content-Type` | `application/json` |
| `X-Admin-Bootstrap-Secret` | Giá trị hiện tại của `ADMIN_BOOTSTRAP_SECRET` |

JSON body:

```json
{
  "username": "admin",
  "password": "thay-bang-mat-khau-rieng-dai-it-nhat-12-ky-tu"
}
```

Thay mật khẩu ví dụ bằng mật khẩu riêng dài **ít nhất 12 ký tự**. Không gửi mật khẩu thật trong chat hoặc lưu vào source code.

### Bước 3: Kiểm tra kết quả

Nếu tạo thành công, API trả HTTP `201` với thông tin tương tự:

```json
{
  "id": 1,
  "username": "admin",
  "role": "ADMIN"
}
```

Backend tự hash mật khẩu bằng bcrypt; Postman gửi mật khẩu thường, **không gửi `password_hash`**. API được bảo vệ bằng bootstrap secret và chỉ tạo ADMIN đầu tiên. Nếu database đã có ADMIN, API trả HTTP `409`; không thể dùng endpoint này để thêm ADMIN tiếp theo.

### Bước 4: Đóng bootstrap sau khi sử dụng

Sau khi nhận HTTP `201`:

1. Xóa dòng `ADMIN_BOOTSTRAP_SECRET` khỏi `auth-service/.env` (hoặc thay bằng một giá trị ngẫu nhiên mới và không sử dụng lại secret cũ).
2. Khởi động lại auth-service để cấu hình có hiệu lực:

   ```powershell
   .\scripts\dev.ps1 restart auth-service
   ```

3. Đăng nhập ở `http://localhost:4200` bằng username và mật khẩu vừa tạo.
4. Sau khi đăng nhập, API login trả JWT; frontend tự lưu và gửi JWT khi gọi API được bảo vệ.

> Bootstrap secret là bí mật tương đương thông tin khởi tạo quản trị. Không chia sẻ, commit hoặc để endpoint bootstrap mở với secret mặc định.

---

## 6. Đăng nhập và cấp tài khoản sinh viên

### Tài khoản ADMIN

Đăng nhập tại `http://localhost:4200` bằng tài khoản tạo ở phần 5 (hoặc tài khoản ADMIN có sẵn trong database). Tài khoản ADMIN dùng để quản lý sinh viên, đề tài, đăng ký và cấp/reset tài khoản sinh viên.

### Tài khoản STUDENT

Khi ADMIN thêm hồ sơ sinh viên từ giao diện, frontend tự gọi API cấp tài khoản. Nếu cần cấp lại thủ công, dùng Postman:

| Trường | Giá trị |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/auth/admin/provision-student` |
| Headers | `Content-Type: application/json` và `Authorization: Bearer <JWT_ADMIN>` |
| Body | `raw` → `JSON` |

```json
{
  "ma_sv": "SV001"
}
```

Mật khẩu ban đầu được tạo từ mã sinh viên và họ tên đã chuẩn hóa; sinh viên phải đổi mật khẩu ở lần đăng nhập đầu tiên. Không gọi API này để tạo ADMIN.

### Reset mật khẩu STUDENT

ADMIN có thể dùng nút **Reset tài khoản** trên trang sinh viên. API đặt mật khẩu tạm thời theo mã sinh viên và họ tên đã chuẩn hóa, giữ nguyên username và yêu cầu sinh viên đổi mật khẩu ở lần đăng nhập tiếp theo.

---

## 7. Các lệnh Docker thường dùng

Chạy tại thư mục gốc repository:

### Toàn bộ backend và API Gateway

| Lệnh | Tác dụng |
|---|---|
| `.\scripts\dev.ps1 check` | Kiểm tra cấu hình Compose, không chạy container |
| `.\scripts\dev.ps1 up` | Build nếu cần và chạy toàn bộ service ở chế độ nền |
| `.\scripts\dev.ps1 status` | Xem trạng thái các container |
| `.\scripts\dev.ps1 logs` | Theo dõi log toàn bộ service; nhấn `Ctrl+C` để thoát |
| `.\scripts\dev.ps1 restart` | Tạo lại và chạy toàn bộ service |
| `.\scripts\dev.ps1 down` | Dừng, gỡ container và network; không xóa database trên host |

### Một service cụ thể

Thay `auth-service` bằng một tên service hợp lệ: `auth-service`, `sinhvien-service`, `detai-service`, `dangky-service` hoặc `api-gateway`.

| Lệnh | Tác dụng |
|---|---|
| `.\scripts\dev.ps1 start auth-service` | Build nếu cần, chạy service và các dependency |
| `.\scripts\dev.ps1 stop auth-service` | Dừng service nhưng giữ container |
| `.\scripts\dev.ps1 restart auth-service` | Tạo lại và chạy riêng service |
| `.\scripts\dev.ps1 logs auth-service` | Theo dõi log service |
| `.\scripts\dev.ps1 status auth-service` | Xem trạng thái service |

Dừng một service có thể làm các service phụ thuộc vào nó tạm thời không hoạt động.

---

## 8. Địa chỉ và cổng dịch vụ

| Thành phần | Địa chỉ trên host |
|---|---|
| Angular frontend | `http://localhost:4200` |
| API Gateway | `http://localhost:3000` |
| Auth Service | `http://localhost:3001` |
| SinhVien Service | `http://localhost:3002` |
| DeTai Service | `http://localhost:3003` |
| DangKy Service | `http://localhost:3004` |
| PostgreSQL (mặc định) | `localhost:5433` |

Các API nghiệp vụ nên được gọi qua API Gateway. Các cổng backend được publish trên loopback để phát triển và kiểm thử cục bộ.

---

## 9. Khắc phục sự cố

### `ADMIN_BOOTSTRAP_SECRET chưa được cấu hình hoặc không đủ mạnh`

- Kiểm tra `auth-service/.env` có `ADMIN_BOOTSTRAP_SECRET` dài ít nhất 32 ký tự.
- Nếu vừa sửa `.env`, chạy `.\scripts\dev.ps1 restart auth-service`.

### Bootstrap trả HTTP `403`

- Kiểm tra header tên chính xác là `X-Admin-Bootstrap-Secret`.
- Giá trị header phải khớp với giá trị đang được auth-service nạp; không thêm dấu ngoặc hoặc khoảng trắng.

### Bootstrap trả HTTP `409`

Database đã có ADMIN. Bootstrap chỉ dùng tạo ADMIN đầu tiên; hãy đăng nhập bằng tài khoản ADMIN có sẵn. Nếu quên tài khoản, hãy dùng quy trình quản trị/phục hồi phù hợp với môi trường của bạn, không mở public registration hoặc cho phép client tự chọn role.

### API trả lỗi kết nối database

- Đảm bảo PostgreSQL đang chạy và lắng nghe đúng port.
- Kiểm tra username, password, host và tên database trong `DATABASE_URL`.
- Nếu PostgreSQL dùng port không phải `5433`, cập nhật tất cả file `.env`.
- Chạy `.\scripts\dev.ps1 logs auth-service` để xem log auth-service.

### Không truy cập được frontend hoặc API

- Kiểm tra Docker Desktop đang chạy.
- Chạy `.\scripts\dev.ps1 status` và đợi các service ở trạng thái healthy.
- Xem log bằng `.\scripts\dev.ps1 logs` hoặc log của service cụ thể.
- Kiểm tra các cổng `3000`–`3004`, `4200` và cổng PostgreSQL không bị chương trình khác chiếm dụng.

---

## 10. Lưu ý bảo mật

- Không commit file `.env`, JWT secret, bootstrap secret, mật khẩu, database backup hoặc dữ liệu không được phép chia sẻ.
- Không dùng giá trị secret mẫu trong môi trường thực tế.
- Dùng `ADMIN_BOOTSTRAP_SECRET` chỉ để tạo ADMIN đầu tiên; xóa hoặc thay secret sau khi bootstrap và restart auth-service.
- Không mở đăng ký công khai cho phép client tự gửi role `ADMIN`.
- Chỉ chia sẻ mật khẩu tạm thời cho đúng sinh viên qua kênh riêng.
- PostgreSQL chạy trên host, không nằm trong Docker Compose. Compose không tự tạo hoặc xóa database trên host.
