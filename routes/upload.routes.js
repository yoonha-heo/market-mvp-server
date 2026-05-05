const express = require("express");
const multer = require("multer");
const { supabase } = require("../lib/supabase");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file" });
    }

    const ext = file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const { data } = supabase.storage.from("images").getPublicUrl(fileName);

    return res.json({
      imageUrl: data.publicUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
