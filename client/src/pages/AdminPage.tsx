import React, { useState, useEffect } from "react";
import axios from "axios";
import "../index.css"; // ✅ استيراد ملف CSS

const AdminPage: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [list, setList] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [meals, setMeals] = useState<{ [key: string]: any[] }>({});
    const [editingMeal, setEditingMeal] = useState<{ id: string; list: string } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        axios.get("http://localhost:5000/categories")
            .then(response => {
                setCategories(response.data);
                if (response.data.length > 0) {
                    setList(response.data[0]);
                }

                response.data.forEach((category: string) => {
                    axios.get(`http://localhost:5000/meals/${category}`)
                        .then(res => {
                            setMeals(prev => ({ ...prev, [category]: res.data }));
                        })
                        .catch(err => console.error(`Error fetching ${category}:`, err));
                });
            })
            .catch(error => console.error("Error fetching categories:", error));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !list || (editingMeal === null && !image)) {
            alert("Please fill all fields and select an image.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        if (image) formData.append("image", image);
        formData.append("name", name);
        formData.append("price", price);

        try {
            let response;
            if (editingMeal) {
                response = await axios.put(
                    `http://localhost:5000/meals/${editingMeal.list}/${editingMeal.id}`,
                    { name, price }
                );
                setEditingMeal(null);
            } else {
                response = await axios.post(`http://localhost:5000/upload/${list}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
        
            console.log("Server response:", response.data); // ✅ استخدام المتغير لتجنب الخطأ
        
            alert(editingMeal ? "Meal updated successfully!" : "Meal added successfully!");
        
            setName("");
            setPrice("");
            setImage(null);
            (document.getElementById("fileInput") as HTMLInputElement).value = "";
        
            const updatedMeals = await axios.get(`http://localhost:5000/meals/${list}`);
            setMeals((prev) => ({ ...prev, [list]: updatedMeals.data }));
        } catch (error) {
            console.error("Error:", error);
            alert("Operation failed!");
        } finally {
            setLoading(false);
        }
    };        

    const handleDelete = async (list: string, id: string) => {
        if (!window.confirm("Are you sure you want to delete this meal?")) return;

        try {
            await axios.delete(`http://localhost:5000/meals/${list}/${id}`);
            alert("Meal deleted successfully!");

            const updatedMeals = await axios.get(`http://localhost:5000/meals/${list}`);
            setMeals(prev => ({ ...prev, [list]: updatedMeals.data }));
        } catch (error) {
            console.error("Error deleting meal:", error);
            alert("Failed to delete meal.");
        }
    };

    const handleEdit = (list: string, id: string, mealName: string, mealPrice: string) => {
        setName(mealName);
        setPrice(mealPrice);
        setList(list);
        setEditingMeal({ id, list });
    };

    // ✅ وظيفة إلغاء التعديل وإعادة النموذج لحالته الأصلية
    const handleCancelEdit = () => {
        setName("");
        setPrice("");
        setImage(null);
        setEditingMeal(null);
        (document.getElementById("fileInput") as HTMLInputElement).value = "";
    };

    return (
        <div>
            <h1>Admin Panel</h1>

            {/* ✅ مربع البحث */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search meals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* ✅ نموذج الإضافة/التعديل */}
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Meal Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <input type="text" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
                    <select onChange={(e) => setList(e.target.value)} value={list}>
                        {categories.map(category => (
                            <option key={category} value={category}>{category.replace("list-", "List ")}</option>
                        ))}
                    </select>
                    <input id="fileInput" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                    <div className="button-group">
                        <button type="submit" disabled={loading}>
                            {loading ? "Processing..." : editingMeal ? "Update Meal" : "Add Meal"}
                        </button>
                        {editingMeal && (
                            <button type="button" className="cancel-btn" onClick={handleCancelEdit}>Cancel Edit</button>
                        )}
                    </div>
                </form>
            </div>

            {/* ✅ عرض الوجبات */}
            <div className="admin-meals-container">
                {categories.map(category => (
                    <div key={category}>
                        <h2 className="meals-category">{category.replace("list-", "List ")}</h2>
                        {meals[category]
                            ?.filter(meal => meal.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(meal => (
                                <div className="admin-meal-item" key={meal._id}>

                                    {/* ✅ أزرار التعديل والحذف على اليسار */}
                                    <div className="admin-meal-actions">
                                        <button className="admin-edit-btn" onClick={() => handleEdit(category, meal._id, meal.name, meal.price)}>Edit</button>
                                        <button className="admin-delete-btn" onClick={() => handleDelete(category, meal._id)}>Delete</button>
                                    </div>

                                    {/* ✅ الصورة في المنتصف */}
                                    <img src={`http://localhost:5000${meal.imageUrl}`} alt={meal.name} />

                                    {/* ✅ الاسم والسعر على اليمين */}
                                    <div className="admin-meal-info">
                                        <strong>{meal.name}</strong>
                                        <p>${meal.price}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                ))}
            </div>



        </div>
    );
};

export default AdminPage;
