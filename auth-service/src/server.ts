
import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Auth Service running at http://localhost:${PORT}`);
});
