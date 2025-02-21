import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../index.css"; // ✅ استيراد ملف CSS المحسن
import RestaurantInfo from "../components/RestaurantInfo";


const HomePage: React.FC = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [meals, setMeals] = useState<{ [key: string]: any[] }>({});
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        axios.get("http://localhost:5000/categories")
            .then(response => {
                setCategories(response.data);
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

    // ✅ وظيفة التمرير إلى القسم المطلوب عند الضغط على عنصر في الهيدر
    const scrollToCategory = (category: string) => {
        const element = categoryRefs.current[category];
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div>
            {/* ✅ إضافة الهيدر مع التنقل بين الأصناف */}
            <header className="menu-header">
                {categories.map(category => (
                    <button key={category} onClick={() => scrollToCategory(category)}>
                        {category.replace("list-", "List ")}
                    </button>
                ))}
            </header>


            <h1 className="text-center">Restaurant Menu</h1>
            <div className="meals-container">
                {categories.map(category => (
                    <div key={category} ref={(el) => { categoryRefs.current[category] = el; }}>
                        <h2 className="meals-category">{category.replace("list-", "List ")}</h2>
                        <div className="meals-list">
                            {meals[category]?.length === 0 ? <p>No meals available</p> : (
                                meals[category]?.map(meal => (
                                    <div className="meal-item" key={meal._id}>
                                        <img src={`http://localhost:5000${meal.imageUrl}`} alt={meal.name} />
                                        <div className="meal-info">
                                            <strong>{meal.name}</strong>
                                            <p>${meal.price}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="home-container">
                <h1>Welcome to Our Menu</h1>

                {/* ✅ هنا يتم عرض قائمة الوجبات */}

                {/* ✅ بيانات المطعم في الأسفل */}
                <RestaurantInfo />
            </div>
        </div>

    );
};

export default HomePage;
