import React, { useReducer, useState, useContext } from "react";
import "./Add.scss";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import {UserContext} from '../../context/UserContext'

const Add = () => {


  const { id } = useParams();

  const parameter = id || "post"

  const [post, setPost] = useState(true)
  const [hide, setHide] = useState(false)

  useEffect(()=>{

  parameter === "post" ? setPost(true) : setPost(false)
  parameter === "post" ? setHide(true) : setHide(false)


  },[])

  
  

  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  

  const { currentUser } = useContext(UserContext);

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);
  console.log(state)
  

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };
  const handleFeature = (e) => {
    e.preventDefault();
    dispatch({
      type: "ADD_FEATURE",
      payload: e.target[0].value,
    });
    e.target[0].value = "";
  };
 /*
  const handleUpload = async () => {
    setUploading(true);
    try {
      const cover = await upload(singleFile) || "https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFjZWJvb2slMjBjb3ZlcnxlbnwwfHwwfHw%3D&w=1000&q=80";

      const images = await Promise.all(
        [...files].map(async (file) => {
          const url = await upload(file);
          return url;
        })
      ) || "https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFjZWJvb2slMjBjb3ZlcnxlbnwwfHwwfHw%3D&w=1000&q=80";
      setUploading(false);
      dispatch({ type: "ADD_IMAGES", payload: { cover, images } });
    } catch (err) {
      console.log(err);
    }
  }; */

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const mutationPost = useMutation({
    mutationFn: (gigInfo) => {
      return newRequest.post("/gigs", gigInfo) 
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"],[id],['orders']);
      navigate("/mygigs")
    }
  }); 

  const mutationUpdate = useMutation({
    mutationFn: (gigInfo) => {
      return newRequest.put(`/gigs/${id}`, gigInfo) 
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"],[id],['orders']);
      navigate("/mygigs")
    }
  }); 

  const handleSubmit = (e) => {
    e.preventDefault();
    const gigDetails = state
    // SOMETIMES THERES A LOCAL STORAGE BUG
    post ? mutationPost.mutate(gigDetails) : mutationUpdate.mutate(gigDetails) 
    
  };

  const handleHttp = (method) => {
    console.log(`http method changed`)
    method === "update" ? setPost(!post) : setPost(post)
  };

  return (
    <div className="add">
      <div className="container">
        {post ? <h1>Add New Gig</h1> : <h1> Update Gig </h1> }
        {!hide && <button onClick={()=> handleHttp("update")}> {post ? "Update Gig" : "Add New Gig"} </button> }
        <div className="sections">
          <div className="info">
            <label htmlFor="">Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. I will do something I'm really good at"
              onChange={handleChange}
            />
            <label htmlFor="">Category</label>
            <select name="category" id="category" onChange={handleChange}>
              <option value="design">Design</option>
              <option value="web">Web Development</option>
              <option value="animation">Animation</option>
              <option value="music">Music</option>
            </select>
            <div className="images">
              <div className="imagesInputs">
                <label htmlFor="">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSingleFile(e.target.files[0])}
                />
                <label htmlFor="">Upload Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                />
              </div>
             
            </div>
            <label htmlFor="">Description</label>
            <textarea
              name="description"
              id=""
              placeholder="Brief descriptions to introduce your service to customers"
              cols="0"
              rows="16"
              onChange={handleChange}
            ></textarea>
            <button onClick={handleSubmit}>{post ? "Create" : "Update"}</button>
          </div>
          <div className="details">
            <label htmlFor="">Service Title</label>
            <input
              type="text"
              name="shortTitle"
              placeholder="e.g. One-page web design"
              onChange={handleChange}
            />
            <label htmlFor="">Short Description</label>
            <textarea
              name="shortDesc"
              onChange={handleChange}
              id=""
              placeholder="Short description of your service"
              cols="30"
              rows="10"
            ></textarea>
            <label htmlFor="">Delivery Time (e.g. 3 days)</label>
            <input type="number" name="deliveryTime" onChange={handleChange} />
            <label htmlFor="">Revision Number</label>
            <input
              type="number"
              name="revisionNumber"
              onChange={handleChange}
            />
            <label htmlFor="">Add Features</label>
            <form action="" className="add" onSubmit={handleFeature}>
              <input type="text" placeholder="e.g. page design" />
              <button type="submit">add</button>
            </form>
            <div className="addedFeatures">
              {state?.features?.map((f) => (
                <div className="item" key={f}>
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_FEATURE", payload: f })
                    }
                  >
                    {f}
                    <span>X</span>
                  </button>
                </div>
              ))}
            </div>
            <label htmlFor="">Price</label>
            <input type="number" onChange={handleChange} name="price" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;
