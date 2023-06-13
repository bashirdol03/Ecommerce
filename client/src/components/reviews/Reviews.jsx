import { useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import React from "react";
import { useEffect } from "react";
import { useState,  useContext  } from "react";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
import "./Reviews.scss";
import {UserContext} from '../../context/UserContext'


const Reviews = ({ gigId }) => {

  const[add,setAdd] = useState(true)
  const[errorMessage, setErrorMessage] = useState("")
  

  const { currentUser } = useContext(UserContext);
  const queryClient = useQueryClient()
  const { isLoading, error, data } = useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      newRequest.get(`/reviews/${gigId}`).then((res) => {  
        return res.data;
      }),

    

    /*onCompleted:()=>{
        const isReviewed =  data.some(review => {
          console.log(review.userId)
          console.log(currentUser._id)
          return review.userId.toString() === currentUser._id.toString()
      })
        console.log(isReviewed)
        isReviewed ? setAdd(false) : setAdd(true)
        console.log(add)
      
      } */

    });  


  console.log(error)  

    
  

  useEffect(()=>{
    if(data && currentUser) {
    const isReviewed =  data.some(review => {
    console.log(review.userId)
    console.log(currentUser._id)
    return review.userId.toString() === currentUser._id.toString()})
    console.log(isReviewed)
    isReviewed ? setAdd(false) : setAdd(true)
    console.log(add)}


  },[data]) 


   
  const mutationPost = useMutation({
    mutationFn: (review) => {
      return newRequest.post("/reviews", review);
    },
    onSuccess:()=>{
      queryClient.invalidateQueries(["reviews"],[gigId],["gigs"])
      setErrorMessage("") 
    },
    onError: (error) => {
      const errMsg = (error.response.data.errorMessage)
      setErrorMessage(errMsg)    
    }
  });

  const mutationUpdate = useMutation({
    mutationFn: (review) => {
      const updatedReview = {...review, userId : currentUser._id}
      return newRequest.put("/reviews", updatedReview);
    },
    onSuccess:()=>{
      queryClient.invalidateQueries(["reviews"],[gigId],["gigs"])
      setErrorMessage("") 
    },
    onError: (error) => {
      const errMsg = (error.response.data.errorMessage)
      setErrorMessage(errMsg)    
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = e.target[0].value;
    const star = e.target[1].value;
    add? mutationPost.mutate({ gigId, desc, star }) : mutationUpdate.mutate({ gigId, desc, star }) ;
  };

  return (
    <div className="reviews">
      <h2>Reviews</h2>
      {isLoading
        ? "loading"
        : error
        ? "Something went wrong!"
        : data.map((review) => <Review key={review._id} review={review} />) || ""}

     { currentUser?.role === "USER"
     &&
    ( <div className="add">

        {add === true ? <h3>Add a review</h3> : <h3>Update your review</h3>}
        <form action="" className="addForm" onSubmit={handleSubmit}>
          <input type="text" placeholder= {add === true ? "write your opinion" : "update your review" } />
          <select name="" id="">
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
          <button>Send</button>
        </form>
      </div> )    }
      
      {errorMessage && <p>errorMessage : {errorMessage}</p>}
      
    </div> 
  );
};

export default Reviews;
