import React, { useState , useEffect, useContext} from "react";
import upload from "../../utils/upload";
import "./Register.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import {UserContext} from '../../context/UserContext';

function Register() {
  const [errorMessage, setErrorMessage] = useState("")
  const [file, setFile] = useState(null);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    img: "",
    country: "",
    role: "USER",
    desc: "",
  });
  console.log(user)

  const navigate = useNavigate();

  const { currentUser, setCurrentUser, /*setPrevUser*/ } = useContext(UserContext);

  const getLoggedInUser = async () => {
    try {
      const res = await newRequest.get("/users/current/user");
      setCurrentUser(res.data);
      navigate("/"); // Redirect to home if already logged in
    } catch (err) {
      setCurrentUser(null); // stay on login if not logged in
    }
  };

  useEffect(() => {
    getLoggedInUser();
  }, []);
  

  const handleChange = (e) => {
    setUser((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
    
  };

  const handleSeller = (e) => {
    
    setUser((prev) => {
      return { ...prev, role : `${e.target.checked ? "SELLER" : "USER"}` };
    })
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = await upload(file);
    try {
      await newRequest.post("/auth/register", {
        ...user,
        img: url,
      });
      navigate("/")
    } catch (err) {
      console.log(err.response);
      setErrorMessage(err.response.data.errorMessage)
    }
  };
  return (
    <>
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div className="left">
          <h1>Create a new account</h1>
          <label htmlFor="">Username</label>
          <input
            name="username"
            type="text"
            placeholder="johndoe"
            onChange={handleChange}
          />
          <label htmlFor="">Email</label>
          <input
            name="email"
            type="email"
            placeholder="email"
            onChange={handleChange}
          />
          <label htmlFor="">Password</label>
          <input name="password" type="password" onChange={handleChange} />
          <label htmlFor="">Confirm Password</label>
          <input name="confirmPassword" type="password" onChange={handleChange} />
          <label htmlFor="">Profile Picture</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <label htmlFor="">Country</label>
          <input
            name="country"
            type="text"
            placeholder="Usa"
            onChange={handleChange}
          />
          <button type="submit">Register</button>
          {errorMessage && (<p>{errorMessage}</p>)}
        </div>
        <div className="right">
          <h1>I want to become a seller</h1>
          <div className="toggle">
            <label htmlFor="">Activate the seller account</label>
            <label className="switch">
              <input type="checkbox" onChange={handleSeller} />
              <span className="slider round"></span>
            </label>
          </div>
          <label htmlFor="">Phone Number</label>
          <input
            name="phone"
            type="text"
            placeholder="+1 234 567 89"
            onChange={handleChange}
          />
          <label htmlFor="">Description</label>
          <textarea
            placeholder="A short description of yourself"
            name="desc"
            id=""
            cols="30"
            rows="10"
            onChange={handleChange}
          ></textarea>
        </div>
      </form>
    </div>
   
    </>
  );
}

export default Register;
