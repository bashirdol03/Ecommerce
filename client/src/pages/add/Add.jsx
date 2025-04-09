import React, { useReducer, useState, useContext } from "react";
import "./Add.scss";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { UserContext } from "../../context/UserContext";

const Add = () => {
  const { id } = useParams();
  const parameter = id || "post";

  const [post, setPost] = useState(true);
  const [hide, setHide] = useState(false);
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    setPost(parameter === "post");
    setHide(parameter === "post");
  }, [parameter]);

  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { currentUser } = useContext(UserContext);
  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (!featureInput.trim()) return;
    dispatch({ type: "ADD_FEATURE", payload: featureInput });
    setFeatureInput("");
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const cover = await upload(singleFile);

      const images = await Promise.all(
        [...files].map(async (file) => {
          const url = await upload(file);
          return url;
        })
      );

      setUploading(false);
      dispatch({ type: "ADD_IMAGES", payload: { cover, images } });
      return { cover, images };

    } catch (err) {
      console.log(err);
    }
  };

  const mutationPost = useMutation({
    mutationFn: (gigInfo) => newRequest.post("/gigs", gigInfo),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      navigate("/mygigs");
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: (gigInfo) => newRequest.put(`/gigs/${id}`, gigInfo),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      navigate("/mygigs");
    },
  });

  const handleSubmit = async (e) => {
    
    e.preventDefault();

    const uploaded = await handleUpload();
    if (!uploaded) return; // stop if upload failed

    const gigDetails = {
      ...state,
      coverImage: uploaded.cover,
      images: uploaded.images,
    };
    
    console.log("before posting form")
    console.log(gigDetails)
    post
      ? mutationPost.mutate(gigDetails)
      : mutationUpdate.mutate(gigDetails);
  };

  const handleHttp = () => {
    setPost(!post);
  };

  return (
    <div className="add">
      <div className="container">
        {post ? <h1>Add New Gig</h1> : <h1>Update Gig</h1>}
        {!hide && (
          <button onClick={handleHttp}>
            {post ? "Update Gig" : "Add New Gig"}
          </button>
        )}

        <form onSubmit={handleSubmit}>
          <div className="sections">
            <div className="info">
              <label>Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. I will do something I'm really good at"
                onChange={handleChange}
              />
              <label>Category</label>
              <select name="category" onChange={handleChange}>
                <option value="design">Design</option>
                <option value="web">Web Development</option>
                <option value="animation">Animation</option>
                <option value="music">Music</option>
              </select>
              <div className="images">
                <div className="imagesInputs">
                  <label>Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSingleFile(e.target.files[0])}
                  />
                  <label>Upload Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                  />
                </div>
              </div>
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Brief descriptions to introduce your service to customers"
                rows="6"
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="details">
              <label>Service Title</label>
              <input
                type="text"
                name="shortTitle"
                placeholder="e.g. One-page web design"
                onChange={handleChange}
              />
              <label>Short Description</label>
              <textarea
                name="shortDesc"
                placeholder="Short description of your service"
                rows="6"
                onChange={handleChange}
              ></textarea>
              <label>Delivery Time (e.g. 3 days)</label>
              <input
                type="number"
                name="deliveryTime"
                onChange={handleChange}
              />
              <label>Revision Number</label>
              <input
                type="number"
                name="revisionNumber"
                onChange={handleChange}
              />
              <label>Add Features</label>
              <div className="addFeature">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="e.g. page design"
                />
                <button onClick={handleAddFeature}>Add</button>
              </div>
              <div className="addedFeatures">
                {state?.features?.map((f) => (
                  <div className="item" key={f}>
                    <button
                      type="button"
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
              <label>Price</label>
              <input
                type="number"
                name="price"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="submitContainer">
            <button type="submit">{post ? "Create" : "Update"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
