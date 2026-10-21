
import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 3004;

app.listen(PORT, () => {
  console.log(`DangKy Service running at http://localhost:${PORT}`);
});
