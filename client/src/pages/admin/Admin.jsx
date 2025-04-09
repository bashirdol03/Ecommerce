import React, { useEffect, useRef, useState, useContext } from "react";
import "./Admin.scss";
import UserCard from "../../components/userCard/UserCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation, useNavigate } from "react-router-dom";
import Add from "../add/Add";
import {UserContext} from '../../context/UserContext'

function Admin() {
  const [sort, setSort] = useState("sales");
  const [open, setOpen] = useState(false);
  const minRef = useRef();
  const maxRef = useRef();
  
  const { currentUser } = useContext(UserContext);

  const { search } = useLocation();

  const navigate = useNavigate();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      newRequest
        .get(
          `/users`
        )
        .then((res) => {
          return res.data;
        }),
    onError: () => {
        navigate('/')
    }    
  });

  console.log(data);

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  useEffect(() => {
    refetch();
  }, [sort]);

  const apply = () => {
    refetch();
  };

 

  return (

    <>
    {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : (
        <>   
    <div className="gigs">   
      <div className="container">
        <span className="breadcrumbs"></span>
        <h1>Registered Users</h1>
        <p>
          look at the users on the website
        </p>
        <div className="menu">
          <div className="left">
            <span>Budget</span>
            <input ref={minRef} type="number" placeholder="min" />
            <input ref={maxRef} type="number" placeholder="max" />
            <button onClick={apply}>Apply</button>
          </div>
          <div className="right">
            <span className="sortBy">Sort by</span>
            <span className="sortType">
              {sort === "sales" ? "Best Selling" : "Newest"}
            </span>
            <img src="./img/down.png" alt="" onClick={() => setOpen(!open)} />
            {open && (
              <div className="rightMenu">
                {sort === "sales" ? (
                  <span onClick={() => reSort("createdAt")}>Newest</span>
                ) : (
                  <span onClick={() => reSort("sales")}>Best Selling</span>
                )}
                <span onClick={() => reSort("sales")}>Popular</span>
              </div>
            )}
          </div>
        </div>
        <div className="cards">
          {isLoading
            ? "loading"
            : error
            ? "Something went wrong!"
            : data.map((user) => <UserCard key={user._id} item={user} />)}
        </div>
      </div>
    </div>
    <Add/>
    </> 
    )}
    </>
  );
}

export default Admin;
