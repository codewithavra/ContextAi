/**
 * Node Imports
 */
import multer from "multer";
import path from "node:path";

const uploadDir = path.resolve(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: function (req, file, cb) {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only PDF, DOCX, and TXT files are allowed"));
      return;
    }

    cb(null, true);
  },
});
