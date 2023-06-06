import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import './PageNotFound.css';

function PageNotFound() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const backTo = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('login');
    }
  };

  return (
    <div className="pageDiv">
      <div className="notFoundDiv">
        <h1 className="error">404</h1>
        <div className="content">
          <h2 className="descriptionError">Wygląda na to, że się zgubiłeś</h2>
          <button onClick={backTo} className="button">
            POWRÓT
          </button>
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;
