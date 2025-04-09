import React from "react";
import "./Home.scss";
import Featured from "../../components/featured/Featured";
import TrustedBy from "../../components/trustedBy/TrustedBy";

function Home() {
  return (
    <div className="home">
      <Featured />
      <TrustedBy />
     
    </div>
  );
}

export default Home;
