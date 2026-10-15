const app = require("./app");
require("dotenv").config();

app.listen(process.env.BACKEND_PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${process.env.BACKEND_PORT}`);
});