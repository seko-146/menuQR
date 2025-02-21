import React from "react";
import restaurantInfo from "../restaurantInfo";

const RestaurantInfo: React.FC = () => {
  return (
    <div className="restaurant-info-container">
      <h2>📍 Contact Us</h2>
      <p><strong>📞 Phone:</strong> {restaurantInfo.phone}</p>
      <p><strong>📍 Address:</strong> {restaurantInfo.address}</p>
      <p><strong>📷 Instagram:</strong> <a href={restaurantInfo.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></p>
      <p><strong>📘 Facebook:</strong> <a href={restaurantInfo.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></p>
    </div>
  );
};

export default RestaurantInfo;
