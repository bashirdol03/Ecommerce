import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Orders.scss";
import { useQuery , useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useEffect, useContext } from "react";
import {UserContext} from '../../context/UserContext'

const Orders = () => {
  const { currentUser } = useContext(UserContext);
  console.log(currentUser?.role)

  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      newRequest.get(`/orders`).then((res) => {
        return res.data;
      }),
    onError: () => {
        navigate('/')
    }    

  });

  console.log(data)

  useEffect(()=>{

    if(data) refetch()

  },[data])

  console.log(data)
  
  //console.log(data)
  const mutationUpdate = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });

  const handleConfirm = (id) => {
    mutationUpdate.mutate(id);
  };

  const handleDelete = (id) => {
    mutationDelete.mutate(id);
  };

  return (
    <div className="orders">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Orders</h1>
          </div>
          <table>
            <tr>
            <th>{currentUser.role === "USER" ? "Seller" : "Buyer"}</th>
              <th>Title</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
            {data.map((order) => (
              <tr key={order._id}>
                <td>{currentUser.role === "USER" ? order.sellerId : order.buyerId}</td>
                <td>{order.title}</td>
                <td>{order.price}</td>
                
                
                  
                {currentUser.role !== "USER" && 
                    (
                    <td>    
                          {
                            (currentUser.role !== "USER" && order.isCompleted)
                            ? 
                            "Completed" : 
                            (<span> <button onClick={()=>{handleConfirm(order._id)}}>Confirm Order</button>
                                     -----Pending-----
                                    <button onClick={()=>{handleDelete(order._id)}}>Cancel Order</button>
                            </span>) 
                          }                    
                    </td>
                    )
                    
                    }

                {currentUser.role === "USER" && 
                    (
                    <td>
                        
                      {(currentUser.role === "USER" && order.isCompleted) ? "Completed" : "Pending"} 
                    
                    </td>
                    )
                }    
              </tr>
            ))}
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
