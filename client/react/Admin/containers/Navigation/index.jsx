import React from 'react';
import { Header } from '../../components';
import { ToastContainer } from 'react-toastify';
import PropTypes from "prop-types";
import 'react-toastify/dist/ReactToastify.css';

const Index = (props) => {
  const { children } = props;
  return (
    <div className="app">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} style={{ zIndex: 1999 }} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

Index.propTypes = {
  children: PropTypes.element.isRequired,
};

export default Index;
