const mongoose = require("../mongoose");

const TransactionSchema = new mongoose.Schema({
  receiverName: String,
  transactionType: String,
  status: String,
  transactionDate: Date,
  amount: Number,
  transactionMessage: String,
  phoneNumber: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const TransactionModel = mongoose.model("Transaction", TransactionSchema);
module.exports = TransactionModel;
