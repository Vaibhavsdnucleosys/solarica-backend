// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // ensure uploads folder exists
// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir); // 👈 correct folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// export const upload = multer({ storage });

// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // ✅ absolute path fix
// const uploadDir = path.join(process.cwd(), "uploads");

// // ensure folder exists
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// export const upload = multer({ storage });


import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ absolute path (IMPORTANT FIX)
const uploadDir = path.join(__dirname, "../../uploads");

// ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });