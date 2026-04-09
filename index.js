const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "no token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "invalid token" });
  }
};

app.use(cors());
app.use(express.json());

// 테스트 API
app.get("/test", (req, res) => {
  res.json({ message: "server ok" });
});

app.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  res.json(user);
});

// 회원가입
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email, password required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.log("signup error: ", error);
    res.status(500).json({ error: "signup failed" });
  }
});

// 로그인
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email, password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "wrong password" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("login error: ", error);
    res.status(500).json({ error: "login failed" });
  }
});

// 상품 등록
app.post("/products", authMiddleware, async (req, res) => {
  const { title, price } = req.body;

  const product = await prisma.product.create({
    data: {
      title,
      price,
      userId: req.user.userId,
    },
  });

  res.json(product);
});

// 내 상품만 조회
app.get("/my-products", authMiddleware, async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      userId: req.user.userId,
    },
  });

  res.json(products);
});

// 상품 리스트
app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

// 상품 상세
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  res.json(product);
});

// 찜 추가
app.post("/favorite/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    console.log("productId:", productId);
    console.log("userId:", req.user.userId);

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.userId,
        productId,
      },
    });

    res.json(favorite);
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

// 찜 목록 조회
app.get("/favorites", authMiddleware, async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId: req.user.userId,
    },
    include: {
      product: true,
    },
  });

  res.json(favorites);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
