const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://baigahmad323:KdaXcHsVFSjNg7vd@cluster0snap.392yntg.mongodb.net/snap_solutions?retryWrites=true&w=majority";
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(mongoURI, connectionOptions)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

module.exports = mongoose;
