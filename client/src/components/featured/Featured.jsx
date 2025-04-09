import React, { useState } from "react";
import "./Featured.scss";
import { useNavigate } from "react-router-dom";

function Featured() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate(`/gigs?search=${input}`);
  };

  return (
    <div className="featured">
      <div className="container">
        <h1>Welcome to our e-commerce store</h1>
        <p>Find the products you need, quickly and easily</p>
        <div className="search">
          <div className="searchInput">
            <img src="/img/search.png" alt="Search Icon" />
            <input
              type="text"
              placeholder='Search for products (e.g. "wireless headphones")'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <button onClick={handleSubmit}>Search</button>
        </div>
      </div>
    </div>
  );
}

export default Featured;
