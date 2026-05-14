const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { prisma } = require("../lib/prisma");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { title, price, imageUrl } = req.body;

  const product = await prisma.product.create({
    data: {
      title,
      price,
      imageUrl,
      userId: req.user.userId,
    },
  });

  res.json(product);
});

router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user?.userId;

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const favorites = await prisma.favorite.findMany({
    where: { userId },
  });

  const favoriteIds = new Set(favorites.map((f) => f.productId));

  const result = products.map((p) => ({
    ...p,
    isFavorite: favoriteIds.has(p.id),
  }));

  res.json(result);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  res.json(product);
});

router.get("/my", authMiddleware, async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      userId: req.user.userId,
    },
  });

  res.json(products);
});

module.exports = router;
