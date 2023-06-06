import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Navbar from '../Navbar/Navbar';
import axios from 'axios';

function Home() {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('/profile');
        setUser(response.data);
      } catch (error) {
        navigate('/login');
      }
      setLoading(false);
    }

    fetchData();
  }, [user, navigate, setUser]);

  const handleLogout = () => {
    axios
      .get('/logout')
      .then(() => {
        setUser(null);
        navigate('/login');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const goToLogin = () => {
    navigate('login');
  };

  return (
    <div className="Home">
      {user && <Navbar userLogout={handleLogout} />}
      {loading && <p>Ładowanie danych...</p>}
      <div className="informationDiv">
        {!loading && !user && <p>Użytkownik nie jest zalogowany</p>}
        {!loading && !!user && <h4>Welcome, {user.name}!</h4>}
        {!user && (
          <button onClick={goToLogin} className="loginButton">
            Zaloguj
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;
