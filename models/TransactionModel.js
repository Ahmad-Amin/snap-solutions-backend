const mongoose = require("../mongoose");

const TransactionSchema = new mongoose.Schema({
  receiverName: String,
  type: String,
  Status: String,
  transactionDate: Date,
  amount: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const TransactionModel = mongoose.model("Transaction", TransactionSchema);
module.exports = TransactionModel;
