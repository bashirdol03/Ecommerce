import React, {useState , useEffect} from 'react';
import newRequest from "../utils/newRequest";
import { useNavigate } from "react-router-dom";

export const UserContext = React.createContext();

export const UserContextProvider = ({children}) => {

const [currentUser, setCurrentUser] = useState(null)
const [prevUser, setPrevUser] = useState(null)
console.log(' USER FROM CONTEXT')
console.log(' ----------USER FROM CONTEXT---------')
console.log(currentUser)
/*
useEffect(() =>{
  if(!currentUser){
  try {
    const res = newRequest.get(`/users/${prevUser._id}`);
    console.log(res.data)
    setCurrentUser({...res.data, message : "KEEPING OLD USER FROM USER CONTEXT"})
    console.log(currentUser)
    //localStorage.setItem("currentUser", JSON.stringify(res.data));
    navigate("/")
  } catch (err) {
    console.log(err)
    
  }
}

},[])

*/

  return (
    <UserContext.Provider value={{currentUser, setCurrentUser/*, prevUser, setPrevUser*/}}>

      {children}

    </UserContext.Provider>
  )

}