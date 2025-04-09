import "./app.scss";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import React from "react";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/home/Home";
import Gigs from "./pages/gigs/Gigs";
import Gig from "./pages/gig/Gig";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Add from "./pages/add/Add";
import Orders from "./pages/orders/Orders";
import MyGigs from "./pages/myGigs/MyGigs";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Admin from "./pages/admin/Admin";

import {UserContextProvider} from './context/UserContext'
import { GoogleOAuthProvider } from '@react-oauth/google';


const clientIdEnv = import.meta.env.VITE_CLIENT_ID

function App() {
  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <div className="app">
    
       <UserContextProvider> 
        <QueryClientProvider client={queryClient}>
          <GoogleOAuthProvider clientId={clientIdEnv}>
            <Navbar />
            <Outlet />
          </GoogleOAuthProvider>   
        </QueryClientProvider>
      </UserContextProvider>
     
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/gigs",
          element: <Gigs />,
        },
        {
          path: "/myGigs",
          element: <MyGigs />,
        },
        {
          path: "/orders",
          element: <Orders />,
        },
        {
          path: "/add/:id",
          element: <Add />,
        },
        {
          path: "/admin",
          element: <Admin />,
        },
        {
          path: "/gig/:id",
          element: <Gig />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/login",
          element: <Login />,
        }
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
