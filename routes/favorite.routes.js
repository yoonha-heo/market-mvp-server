const express = require("express");
const { prisma } = require("../lib/prisma");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// toggle favorite
router.post("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      return res.json({
        isFavorite: false,
        message: "favorite removed",
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });

    res.json({
      isFavorite: true,
      message: "favorite added",
      favorite,
    });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

module.exports = router;
