import mongoose, { Schema, Document } from "mongoose";

export interface IItem extends Document {
  name: string;
  price: number;
  imageUrl: string;
}

// ✅ `Schema` مشترك لجميع الأصناف
export const ItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
});

// ✅ إنشاء موديلات متعددة باستخدام نفس الـ `Schema`
export const List1 = mongoose.model<IItem>("List1", ItemSchema);
export const List2 = mongoose.model<IItem>("List2", ItemSchema);
export const List3 = mongoose.model<IItem>("List3", ItemSchema);
