
import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 3003;

app.listen(PORT, () => {
  console.log(`DeTai Service running at http://localhost:${PORT}`);
});
