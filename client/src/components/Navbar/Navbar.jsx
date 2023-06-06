import React, { useState } from 'react';
import './Navbar.css';
import { RxHamburgerMenu } from 'react-icons/rx';
import {
  IoCloseOutline,
  IoCreateOutline,
  IoLogOutOutline,
} from 'react-icons/io5';

import {
  AiOutlineUser,
  AiOutlineSearch,
  AiOutlineCalculator,
} from 'react-icons/ai';
import { IoMdAddCircleOutline } from 'react-icons/io';

import { Link } from 'react-router-dom';

function Navbar(props) {
  const [showMenu, setShowMenu] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);

  const handlePopup = (e) => {
    setOpenPopup(true);
  };

  return (
    <div className={`navigation ${showMenu ? 'active' : ''}`}>
      <div className="icons-hamb">
        {!showMenu ? (
          <RxHamburgerMenu
            onClick={() => setShowMenu(!showMenu)}
            className="sideBarButton"
          ></RxHamburgerMenu>
        ) : (
          <IoCloseOutline
            onClick={() => setShowMenu(!showMenu)}
            className="sideBarButton"
          ></IoCloseOutline>
        )}
      </div>
      <div className="menuToggle">
        <ul className={`menuList ${showMenu ? 'active' : ''}`}>
          <li className="list">
            <Link className="profile" to="/profile">
              <AiOutlineUser className="iconNav"></AiOutlineUser>
              <span className="text">Profil</span>
            </Link>
          </li>
          <li className="list">
            <Link className="addQuestion" to="/add-question">
              <IoMdAddCircleOutline className="iconNav"></IoMdAddCircleOutline>
              <span className="text">Dodaj pytanie</span>
            </Link>
          </li>
          <li className="list">
            <Link className="searchQuestion" to="/search-questions">
              <AiOutlineSearch className="iconNav"></AiOutlineSearch>
              <span className="text">Szukaj pytania</span>
            </Link>
          </li>
          <li className="list">
            <Link className="createScale" to="/scale">
              <AiOutlineCalculator className="iconNav"></AiOutlineCalculator>
              <span className="text">Stwórz skale</span>
            </Link>
          </li>
          <li className="list">
            <Link className="createTest" to="/create-test">
              <IoCreateOutline className="iconNav"></IoCreateOutline>
              <span className="text">Stwórz test</span>
            </Link>
          </li>
          <li className="list">
            <div className="logout" onClick={handlePopup}>
              <IoLogOutOutline className="iconNav"></IoLogOutOutline>
              <span className="text">Wyloguj</span>
            </div>
          </li>
        </ul>
      </div>
      <div>
        {openPopup && (
          <div className="popup">
            <h2>Czy na pewno chcesz się wylogować?</h2>
            <div className="popupButtons">
              <button className="popupNo" onClick={() => setOpenPopup(false)}>
                Anuluj
              </button>
              <button className="popupYes" onClick={props.userLogout}>
                Wyloguj
              </button>
            </div>
          </div>
        )}
        {openPopup && (
          <div className="overlay" onClick={() => setOpenPopup(false)} />
        )}
      </div>
    </div>
  );
}

export default Navbar;
