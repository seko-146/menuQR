import express, { Application, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";


// ✅ استيراد جميع الموديلات والصنفات الديناميكية
import { models, categories } from "./models/categories";

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // ✅ السماح بعرض الصور


// ✅ التأكد من الاتصال بقاعدة البيانات
mongoose
  .connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

mongoose.set("strictQuery", false);

// ✅ إعداد `multer` لحفظ الصور
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "../uploads/")),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ✅ حفظ البيانات في الموديل الصحيح
app.post("/upload/:list", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const listName = req.params.list;
    if (!models[listName]) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const newItem = new models[listName]({
      name,
      price,
      imageUrl: `/uploads/${req.file.filename}`,
    });

    await newItem.save();
    res.status(201).json({ message: "Item added successfully", item: newItem });
  } catch (error) {
    console.error("Error saving item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ جلب جميع البيانات من قائمة معينة
app.get("/meals/:list", async (req: Request, res: Response) => {
  try {
    const listName = req.params.list;
    if (!models[listName]) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const items = await models[listName].find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items" });
  }
});
app.get("/categories", (_req: Request, res: Response) => {
    res.json(categories);
  });
  // ✅ حذف وجبة معينة حسب القائمة و ID
app.delete("/meals/:list/:id", async (req: Request, res: Response) => {
    try {
      const { list, id } = req.params;
      if (!models[list]) {
        return res.status(400).json({ message: "Invalid category" });
      }
  
      const deletedItem = await models[list].findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).json({ message: "Meal not found" });
      }
  
      res.status(200).json({ message: "Meal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting meal" });
    }
  });
  
  // ✅ تعديل وجبة معينة حسب القائمة و ID
  app.put("/meals/:list/:id", async (req: Request, res: Response) => {
    try {
      const { list, id } = req.params;
      const { name, price } = req.body;
      if (!models[list]) {
        return res.status(400).json({ message: "Invalid category" });
      }
  
      const updatedItem = await models[list].findByIdAndUpdate(id, { name, price }, { new: true });
      if (!updatedItem) {
        return res.status(404).json({ message: "Meal not found" });
      }
  
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Error updating meal" });
    }
  });
  
  

// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
