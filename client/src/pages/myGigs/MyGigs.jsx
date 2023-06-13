import React,{ useContext} from "react";
import { Link } from "react-router-dom";
import "./MyGigs.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Add from "../add/Add";
import { useLocation } from "react-router-dom";
import {UserContext} from '../../context/UserContext'

function MyGigs() {
  const { currentUser } = useContext(UserContext);

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () =>
      newRequest.get(`/gigs?userId=${currentUser._id}`).then((res) => {
        console.log(currentUser._id)
        console.log(res.data)
        return res.data;
      }),
      onError: () => {
        navigate('/')
    }    
  });
  console.log(data)
  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/gigs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  const handleDelete = (id) => {
    mutation.mutate(id);
  };

  return (
    <div className="myGigs">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Gigs</h1>
              <Link to="/add/post">
                <button>Add New Gig</button>
              </Link>
          </div>
          <table>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
            {data.map((gig) => (
      
              
              <tr key={gig._id}>
                <td>
                  <img className="image" src={gig.coverImage} alt="" />
                </td>
                <td>
                  <Link to={`/gig/${gig._id}`} className="link">
                    {gig.title}
                  </Link>    
                </td>
                <td>{gig.price}</td>
                <td>

                
              <Link to={`/add/${gig._id}`}>
                Update Gig
              </Link>
                
                </td>
                <td>
                  <img
                    className="delete"
                    src="./img/delete.png"
                    alt=""
                    onClick={() => handleDelete(gig._id)/* CAN ONLY DELETE GIGS WITH GIG-IDS , CANT GIVE A RANDOM ONE NOW THO USING UUID*/} 
                  />
                </td>
             </tr>
          
            ))}
          </table>
        </div>
      )}
    </div>
  );
}

export default MyGigs;
