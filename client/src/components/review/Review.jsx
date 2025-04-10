import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, {useContext} from "react";
import newRequest from "../../utils/newRequest";
import "./Review.scss";

import {UserContext} from '../../context/UserContext'

const Review = ({ review }) => {

  const queryClient = useQueryClient();

  const { currentUser } = useContext(UserContext);

  const { isLoading, error, data } = useQuery(
    {
      queryKey: [review.userId],
      queryFn: () =>
        newRequest.get(`/users/${review.userId}`).then((res) => {
          return res.data;
        }),
    },
  );

 const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"],[review.gigId],["gigs"]);
    },
  });

  const handleDelete = (reviewId) => {
    console.log(reviewId)
    mutation.mutate(reviewId);
  };


  return (
    <div className="review">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="user">
          <img className="pp" src={data.img || "/img/noavatar.jpg"} alt="" />
          <div className="info">
            <span>{data.username}</span>
            <div className="country">
              <span>{data.country}</span>
            </div>
          </div>
        </div>
      )}
     <div className="stars">
      <span className="emoji-stars">
      {"⭐".repeat(Math.round(review.star))}
      </span>
      <span className="rating-number">{Math.round(review.star)}</span>
      </div>
      <p>{review.desc}</p>
      {currentUser?._id === review.userId && (<div className="helpful">
        <span>Delete your review</span>
        <span onClick={() => handleDelete(review._id)}>❌</span>
      </div>)}
    </div>
  );
};

export default Review;
