const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const productRoutes = require("./routes/product.routes");
const favoriteRoutes = require("./routes/favorite.routes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/products", productRoutes);
app.use("/favorite", favoriteRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
