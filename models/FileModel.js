const mongoose = require("../mongoose");
const FileSchema = new mongoose.Schema({
  filename: String,
  size: Number,
  fileType: String,
  data: Buffer, // Binary data
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  timeOfUpload: Date
});

const FileModel = mongoose.model("File", FileSchema);
module.exports = FileModel;