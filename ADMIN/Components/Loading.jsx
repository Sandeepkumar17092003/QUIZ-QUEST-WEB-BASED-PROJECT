import React from "react";
import Styles from "./Loading.module.css"; // Correct import for CSS modules

const Loading = () => {
  return (
    <div className={Styles.spinnerContainer}>
      <div className={Styles.spinner}></div>
    </div>
  );
};

export default Loading;
