const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { config } = require("dotenv");
const cors = require("cors");
const path = require("path");

config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const absolutePath = path.join(__dirname, "images"); // Ensure 'path' is imported
    cb(null, absolutePath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max file size (e.g., 2MB)
  fileFilter: (req, file, cb) => {
    // Custom file type validation (e.g., allow only images)
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported"), false);
    }
  },
});

const Listing = mongoose.model("Listing", {
  title: String,
  description: String,
  photos: [String],
});

app.post("/api/listings", upload.array("photos", 5), async (req, res) => {
  try {
    const { title, description } = req.body;
    const photos = req.files.map((file) => file.path);

    const newListing = new Listing({ title, description, photos });

    await newListing.save();

    return res.status(201).json({ message: "Listing created successfully" });
  } catch (error) {
    console.error("Error creating listing:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
