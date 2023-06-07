import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './LoginRegister.css';

import { AiOutlineUser, AiOutlineMail } from 'react-icons/ai';
import { RiLockPasswordLine } from 'react-icons/ri';

import loginImage from '../../assets/login.svg';
import registerImage from '../../assets/sign_up.svg';

function LoginRegister() {
  const navigate = useNavigate();
  const [dataLogin, setDataLogin] = useState({
    email: '',
    password: '',
  });

  const [dataRegister, setDataRegister] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);
  const [isRegisterFormVisible, setIsRegisterFormVisible] = useState(false);

  const handleRegisterButtonClick = () => {
    setIsLoginFormVisible(false);
    setIsRegisterFormVisible(true);
  };

  const handleLoginButtonClick = () => {
    setIsLoginFormVisible(true);
    setIsRegisterFormVisible(false);
  };

  const registerUser = async (e) => {
    e.preventDefault();
    const { name, email, password } = dataRegister;
    try {
      const { data } = await axios.post('/register', {
        name,
        email,
        password,
      });
      if (data.error) {
        toast.error(data.error);
      } else {
        setDataRegister({});
        toast.success('Utworzono nowego użytkownika.');
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    const { email, password } = dataLogin;
    try {
      const { data } = await axios.post('/login', {
        email,
        password,
      });
      if (data.error) {
        toast.error(data.error);
      } else {
        setDataLogin({});
        sessionStorage.setItem('token', data.token);
        navigate('/profile');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`loginContainer ${isRegisterFormVisible ? 'active' : ''}`}>
      <div className={`loginDescription ${isLoginFormVisible ? 'active' : ''}`}>
        <h2 className="headerDescription">Nowy użytkownik?</h2>
        <p>
          Jeżeli nie posiadasz jeszcze konta, zarejestruj się, aby uzyskać
          dostęp do swojego konta.
        </p>
        <button className="registerButton" onClick={handleRegisterButtonClick}>
          Zarejestruj
        </button>
        <img
          src={registerImage}
          className="imageLogin"
          alt="Rejestracja - img"
        ></img>
      </div>
      <div className={`loginForm ${isLoginFormVisible ? 'active' : ''}`}>
        <h1>Logowanie</h1>
        <form onSubmit={loginUser}>
          <div className="form-div">
            <AiOutlineMail className="input-icon"></AiOutlineMail>
            <input
              type="email"
              placeholder="Email"
              value={dataLogin.email}
              onChange={(e) =>
                setDataLogin({ ...dataLogin, email: e.target.value })
              }
            />
          </div>

          <div className="form-div">
            <RiLockPasswordLine className="input-icon"></RiLockPasswordLine>
            <input
              type="password"
              placeholder="Hasło"
              value={dataLogin.password}
              onChange={(e) =>
                setDataLogin({ ...dataLogin, password: e.target.value })
              }
            />
          </div>

          <button type="submit" className="buttonLogReg">
            Zaloguj
          </button>
        </form>
      </div>

      <div
        className={`registerDescription ${
          isRegisterFormVisible ? 'active' : ''
        }`}
      >
        <h2 className="headerDescription">Posidasz konto?</h2>
        <p>
          Jeżeli, posiadasz konto, zaloguj aby uzyskać dostęp do swojego konta.
        </p>
        <button className="loginButton" onClick={handleLoginButtonClick}>
          Zaloguj
        </button>
        <img src={loginImage} className="imageLogin"></img>
      </div>
      <div className={`registerForm ${isRegisterFormVisible ? 'active' : ''}`}>
        <h1>Rejestracja</h1>
        <form onSubmit={registerUser}>
          <div className="form-div">
            <AiOutlineUser className="input-icon"></AiOutlineUser>
            <input
              type="text"
              placeholder="Nazwa użytkownika"
              value={dataRegister.name}
              onChange={(e) =>
                setDataRegister({ ...dataRegister, name: e.target.value })
              }
            />
          </div>

          <div className="form-div">
            <AiOutlineMail className="input-icon"></AiOutlineMail>
            <input
              type="email"
              placeholder="Email"
              value={dataRegister.email}
              onChange={(e) =>
                setDataRegister({ ...dataRegister, email: e.target.value })
              }
            />
          </div>

          <div className="form-div">
            <RiLockPasswordLine className="input-icon"></RiLockPasswordLine>
            <input
              type="password"
              placeholder="Hasło"
              value={dataRegister.password}
              onChange={(e) =>
                setDataRegister({ ...dataRegister, password: e.target.value })
              }
            />
          </div>

          <button type="submit" className="buttonLogReg">
            Zarejestruj
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginRegister;
