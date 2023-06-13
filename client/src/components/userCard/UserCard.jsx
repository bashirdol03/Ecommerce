import React from "react";
import "./UserCard.scss";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const UserCard = ({ item }) => {
  /*const { isLoading, error, data } = useQuery({
    queryKey: [item.userId],
    queryFn: () =>
      newRequest.get(`/users/${item.userId}`).then((res) => {
        return res.data;
      }),
  });*/
  return (
      <>
      <div className="gigCard">
        {item.role === "ADMIN" &&( "ADMIN ---") }
        <span>USER ROLE :   {item.role === "SELLER" ? `SELLER` : `BUYER`}</span>
        <img src={item.img} alt="" />
        <div className="info">
        {/*
        
        <div className="info">
          {isLoading ? (
            "loading"
          ) : error ? (
            "Something went wrong!"
          ) : (
            <div className="user">
              {<img src={data.img || "/img/noavatar.jpg"} alt="" />
              <span>{data.username}</span> }
            </div>
          )} */}


          <p>{item.username}</p>
          <p>{item.email}</p>
          <div className="star">
            <img src="./img/star.png" alt="" />
            <span>
              {!isNaN(item.totalStars / item.starNumber) &&
                Math.round(item.totalStars / item.starNumber)}
            </span>
          </div>
        </div>
        <hr />
        <div className="detail">
          <img src="./img/heart.png" alt="" />
          <div className="price">
            <span>-</span>
            <h2>-</h2>
          </div>
        </div>

      </div>
      
      </>
    
  );
};

export default UserCard;
