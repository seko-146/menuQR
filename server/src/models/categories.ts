import mongoose from "mongoose";
import { IItem, ItemSchema } from "./schema";

// ✅ قائمة الأصناف التي يمكن تعديلها بسهولة
const categories = ["list-1", "list-2", "list-3", "list-4", "list-5"]; // يمكنك إضافة المزيد هنا

// ✅ إنشاء موديل لكل صنف بشكل ديناميكي
const models: { [key: string]: mongoose.Model<IItem> } = {};

categories.forEach((category) => {
  models[category] = mongoose.model<IItem>(category, ItemSchema);
});

export { models, categories };
