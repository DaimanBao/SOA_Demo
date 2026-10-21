# SOA Demo

## Setup lần đầu trên máy mới (Windows)

Làm lần lượt các bước dưới đây sau khi clone repo. Backend và API Gateway chạy trong Docker nên không cần cài Node.js/npm riêng cho từng service. PostgreSQL chạy trên máy host; frontend chạy trực tiếp trên host.

### 1. Cài và khởi động công cụ

- Cài Git, Docker Desktop và PostgreSQL (nên cùng major version với môi trường dự án).
- Khởi động Docker Desktop.
- Cấu hình PostgreSQL lắng nghe ở port `5433`. Nếu PostgreSQL của bạn dùng port khác, sửa port trong các `DATABASE_URL` ở bước 3.
- Cài Node.js LTS nếu muốn chạy frontend trên máy host.

### 2. Tạo bốn database PostgreSQL rỗng

Tạo database `auth_db`, `sinhvien_db`, `detai_db`, `dangky_db` trên PostgreSQL host. Ví dụ trong PowerShell (đổi `postgres` thành tài khoản PostgreSQL của bạn nếu cần):

```powershell
createdb -h localhost -p 5433 -U postgres auth_db
createdb -h localhost -p 5433 -U postgres sinhvien_db
createdb -h localhost -p 5433 -U postgres detai_db
createdb -h localhost -p 5433 -U postgres dangky_db
```

Các file trong `database` là PostgreSQL custom-format backup, dù phần mở rộng là `.sql`. Nếu muốn nạp schema và dữ liệu mẫu đi kèm repo, khôi phục từng file vào database rỗng tương ứng:

```powershell
pg_restore --no-owner --no-privileges -h localhost -p 5433 -U postgres -d auth_db .\database\auth_db.sql
pg_restore --no-owner --no-privileges -h localhost -p 5433 -U postgres -d sinhvien_db .\database\sinhvien.sql
pg_restore --no-owner --no-privileges -h localhost -p 5433 -U postgres -d detai_db .\database\detai_db.sql
pg_restore --no-owner --no-privileges -h localhost -p 5433 -U postgres -d dangky_db .\database\dangky_db.sql
```

`createdb` và `pg_restore` được cài cùng PostgreSQL client tools. Chỉ restore vào database mới/rỗng; không restore đè lên database đang có dữ liệu cần giữ. Nếu bạn có database đã khởi tạo sẵn thì bỏ qua bước restore. Các bản backup có thể chứa dữ liệu; chỉ chia sẻ/sử dụng nếu bạn được phép.

### 3. Tạo file `.env` cho từng service

Các file `.env` không được đưa lên Git. Từ PowerShell ở thư mục gốc repo, tạo bản cấu hình cục bộ từ file mẫu:

```powershell
Copy-Item .\auth-service\.env.example .\auth-service\.env
Copy-Item .\sinhvien-service\.env.example .\sinhvien-service\.env
Copy-Item .\detai-service\.env.example .\detai-service\.env
Copy-Item .\dangky-service\.env.example .\dangky-service\.env
Copy-Item .\api-gateway\.env.example .\api-gateway\.env
```

Mở các file `.env` vừa tạo và thay:

- `postgres` bằng username PostgreSQL trên máy bạn.
- `change_me` bằng mật khẩu PostgreSQL. Nếu mật khẩu có ký tự đặc biệt trong URL (như `@`, `:`, `/`, `#`, `%`), hãy URL-encode mật khẩu đó.
- `localhost:5433` nếu PostgreSQL dùng port khác.
- Giá trị `JWT_SECRET` mẫu bằng một secret ngẫu nhiên mạnh, rồi đặt **cùng một giá trị** trong cả năm file `.env`. Không dùng secret ví dụ này trong thực tế và không commit file `.env`.

Có thể tạo secret ngẫu nhiên bằng Node.js:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Mỗi `DATABASE_URL` trong mẫu đã trỏ tới database riêng: `auth_db`, `sinhvien_db`, `detai_db` hoặc `dangky_db`. Các URL service trong `.env` dùng `localhost` cho chạy trực tiếp trên host; khi chạy Compose, Docker Compose sẽ thay các URL liên service bằng hostname container nội bộ. Script chạy Compose cũng tự đổi hostname PostgreSQL sang `host.docker.internal`, không sửa file `.env`.

### 4. Kiểm tra cấu hình và chạy backend

Từ thư mục gốc repo:

```powershell
.\scripts\dev.ps1 check
.\scripts\dev.ps1 up
```

Lần đầu Docker sẽ tải base image, cài dependencies bên trong image và build các backend. Các lần sau chỉ build lại khi cần. PostgreSQL không nằm trong Compose và không bị Compose tạo, migrate hay xóa.

### 5. Chạy frontend

Mở một cửa sổ PowerShell khác:

```powershell
Set-Location .\frontend-app
npm install
npm start
```

Mở `http://localhost:4200`. Frontend gọi API Gateway tại `http://localhost:3000`.

## Lệnh quản lý Docker Compose

Chạy tại thư mục gốc repo trong PowerShell.

### Toàn bộ backend và gateway

```powershell
.\scripts\dev.ps1 check    # Kiểm tra cấu hình Compose, không chạy container
.\scripts\dev.ps1 up       # Build nếu cần và bật toàn bộ service ở chế độ nền
.\scripts\dev.ps1 status   # Xem trạng thái các container
.\scripts\dev.ps1 logs     # Theo dõi log toàn bộ service (Ctrl+C để thoát)
.\scripts\dev.ps1 restart  # Build nếu cần và tạo lại toàn bộ service
.\scripts\dev.ps1 down     # Dừng và gỡ container/network; không xóa database host
```

### Một service

```powershell
.\scripts\dev.ps1 start auth-service    # Build nếu cần, bật service và dependency của nó
.\scripts\dev.ps1 stop auth-service     # Dừng service nhưng giữ container
.\scripts\dev.ps1 restart auth-service  # Tạo lại và bật riêng service
.\scripts\dev.ps1 logs auth-service     # Theo dõi log riêng (Ctrl+C để thoát)
.\scripts\dev.ps1 status auth-service   # Xem trạng thái riêng service
```

Tên service hợp lệ: `auth-service`, `sinhvien-service`, `detai-service`, `dangky-service`, `api-gateway`. Thay `auth-service` trong ví dụ bằng service muốn thao tác. Dừng một service có thể làm service phụ thuộc vào nó tạm thời không hoạt động.

Gateway chạy tại `http://localhost:3000`; các backend được publish trên loopback ở port `3001`–`3004`. Compose đợi health check của dependency trước khi khởi động service phụ thuộc.

## PostgreSQL và bảo mật

PostgreSQL chạy trên host, không chạy trong Compose. Container kết nối tới host qua `host.docker.internal`; PostgreSQL cần lắng nghe trên port cấu hình và firewall cho phép kết nối từ Docker Desktop. Nếu gặp lỗi kết nối, kiểm tra service PostgreSQL, port, username/password, tên database và `DATABASE_URL` trong `.env`.

Các file `.env` thật không được đưa vào build context hoặc image. Không commit `.env`, JWT secret, mật khẩu DB hay backup dữ liệu mà bạn không có quyền chia sẻ.
