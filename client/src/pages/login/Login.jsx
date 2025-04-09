import React, { useState , useEffect, useContext} from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import {UserContext} from '../../context/UserContext';
import { useGoogleLogin } from "@react-oauth/google";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

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
  


  // CODE BELOW MUST BE IN THIS FORMAT TO WORK
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'email profile',
    onSuccess: async ({ code }) => {
      try {
        const res = await newRequest.post('auth/loginWithGoogle', {
          code,
        });   
        console.log(res.data)
        setCurrentUser({...res.data, message : "FROM USER CONTEXT"})
        console.log(currentUser)
        navigate("/")
        // IF YOU NAVIGATE ON YOUR OWN USER FROM CONTEXT IS LOST SOMEHOW
        // GOING FROM HOME PAGE TO LOGIN PAGE MAKES CONTEXT NLOSE THE LOGGED IN USER
      } catch (err) {
        console.log(err);
        if(err) setError(err.response.data.errorMessage || err.response.data);
        console.log(err.response.data.errorMessage || err.response.data) 
      }
    }
  });
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await newRequest.post("/auth/logout");
      console.log(res)
      setCurrentUser(null)
      setError(null)
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await newRequest.post("/auth/login", { email, password });
      console.log(res.data)
      setCurrentUser({...res.data, message : "FROM USER CONTEXT"})
      //setPrevUser({...res.data, message : "FROM USER CONTEXT"})
      console.log(currentUser)
      //localStorage.setItem("currentUser", JSON.stringify(res.data));
      navigate("/")
    } catch (err) {
      console.log(err)
      if(err) setError(err.response.data.errorMessage || err.response.data);
      console.log(err.response.data.errorMessage || err.response.data) 
    }
  };

  const showCurrentuser = async () => {
     console.log(currentUser)
  }

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <label htmlFor="">Email</label>
        <input
          name="email"
          type="email"
          placeholder="johndoe"
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="">Password</label>
        <input
          name="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && error}
        <button type="button" onClick={() => googleLogin()}>
        Sign in with Google 🚀{' '}
        </button>
       {/* <button type="button" onClick={() => handleLogout()}>
        Logout
        </button>
        <button type="button" onClick={() => showCurrentuser()}>
        see current user
        </button>*/}
        {currentUser && currentUser.email}
      </form>

   
        
    </div>
  );
}

export default Login;
