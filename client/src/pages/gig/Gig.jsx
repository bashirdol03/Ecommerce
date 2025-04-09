import React, {useContext} from "react";
import "./Gig.scss";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";
import {UserContext} from '../../context/UserContext'

function Gig() {
  const { id } = useParams();

  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  console.log(currentUser)
  console.log("LOGGED IN USER ABOVE")

  const { isLoading, error, data } = useQuery({
    queryKey: [id],
    queryFn: () =>
      newRequest.get(`/gigs/single/${id}`).then((res) => {
        console.log(res.data)
        return res.data;
      }),
  });

  

  const userId = data?.userId;

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => {
        console.log(res.data)
        return res.data;
      }),
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.post(`/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      navigate(`/orders`)
    },
  });

  const handleOrder = (id) => {
    mutation.mutate(id);
  };
 



  return (
    <div className="gig">
      {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="container">
          <div className="left">
            <h1>{data.title}</h1>
            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="user">
                <img
                  className="pp"
                  src={dataUser.img || "/img/noavatar.jpg"}
                  alt=""
                />
                <span>{dataUser.username}</span>
                {!isNaN(data.totalStars / data.starNumber) && (
                  <div className="stars">
                    {Array(Math.round(data.totalStars / data.starNumber))
                      .fill()
                      .map((item, i) => (
                        <img src="/img/star.png" alt="" key={i} />
                      ))}
                    <span>{Math.round(data.totalStars / data.starNumber)}</span>
                  </div>
                )}
              </div>
            )}
            

             
            <img src={data.coverImage} alt="" />

            {data.images?.length > 0 && (
              <div className="gallery">
                {data.images.map((img, i) => (
                  <img key={i} src={img} alt={`gig-image-${i}`} />
                ))}
              </div>
            )}
            

            <h2>About This Gig</h2>
            <p>{data.description}</p>
            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="seller">
                <h2>About The Seller</h2>
                <div className="user">
                  <img src={dataUser.img || "/img/noavatar.jpg"} alt="" />
                  <div className="info">
                    <span>{dataUser.username}</span>
                    {!isNaN(data.totalStars / data.starNumber) && (
                      <div className="stars">
                        {Array(Math.round(data.totalStars / data.starNumber))
                          .fill()
                          .map((item, i) => (
                            <img src="/img/star.png" alt="" key={i} />
                          ))}
                        <span>
                          {Math.round(data.totalStars / data.starNumber)}
                        </span>
                      </div>
                    )}


                    
            
                    
                   
                  </div>
                </div>
                <div className="box">


                <div className="items">
                    <div className="item">
                      <span className="title">From</span>
                      <span className="desc">{dataUser.country}</span>
                    </div>
                    <div className="item">
                      <span className="title">Delivery Time</span>
                      <span className="desc">{data.deliveryTime} Days</span>
                    </div>
                    <div className="item">
                      <span className="title">Revisions</span>
                      <span className="desc">{data.revisionNumber}</span>
                    </div>
                    <div className="item">
                      <span className="title">Gig Created</span>
                      <span className="desc">
                        {new Date(data.createdAt).toLocaleDateString("default", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                 </div>

                  <hr />
                  <p>{dataUser.desc}</p>
                </div>
              </div>
            )}
            <Reviews gigId={id} />
          
          </div>
          <div className="right">
            <div className="price">
              <h3>{data.shortTitle}</h3>
              <h2>$ {data.price}</h2>
            </div>
            <p>{data.shortDesc}</p>
            <div className="details">
              <div className="item">
                <img src="/img/clock.png" alt="" />
                <span>{data.deliveryTime} Days Delivery</span>
              </div>
              <div className="item">
                <img src="/img/recycle.png" alt="" />
                <span>{data.revisionNumber} Revisions</span>
              </div>
            </div>
            <div className="features">
              {data.features.map((feature) => (
                <div className="item" key={feature}>
                  <img src="/img/greencheck.png" alt="" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            {currentUser?.role === "USER" && (
            <button onClick={() => handleOrder(data._id)}>Order</button>
              ) }

            {!currentUser && (
              <p className="login-message">Sign in to place an order</p>
            )}
             

          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;
