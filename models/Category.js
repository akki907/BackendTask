const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, trim: true, unique: true, required: true },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date
  }
});

module.exports = mongoose.model("Category", CategorySchema);
