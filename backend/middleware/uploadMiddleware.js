const multer = require("multer");

// Store file temporarily in memory buffer, not disk
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
