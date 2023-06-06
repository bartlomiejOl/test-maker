import React, { useContext, useState } from 'react';
import './SearchQuestions.css';
import Navbar from '../Navbar/Navbar';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function SearchQuestions() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState([]);
  const [expandQuestion, setExpandQuestion] = useState('');

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

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(
        `/searchQuestion/${searchTerm}/${user.email}`
      );
      if (res.data.questions.length > 0) {
        setQuestions(res.data.questions);
      } else {
        toast.error('Nie znaleziono pytań pasujących do wyszukiwania');
        console.log(res.data);
        setQuestions([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Wystąpił błąd podczas wyszukiwania pytań');
      setQuestions([]);
    }
  };

  const handleExpand = (id) => {
    if (id === expandQuestion) {
      setExpandQuestion('');
    } else {
      setExpandQuestion(id);
    }
  };

  return (
    <div className="SearchQuestions">
      <Navbar userLogout={handleLogout} />
      <div className="containerSearchQuestions">
        <div className="topDiv">
          <form className="searchForm" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Wyszukaj pytanie"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="searchButton">
              Szukaj
            </button>
          </form>
        </div>
        <div className="contentDiv">
          <ul>
            {questions.map((question) => (
              <li
                key={question._id}
                className={`questionItem ${
                  expandQuestion === question._id ? 'expanded' : ''
                }`}
                onClick={() => handleExpand(question._id)}
              >
                <div className="questionText">{question.question}</div>
                {expandQuestion === question._id && (
                  <div className="questionDetails">
                    {question.answers.map((answer, index) => (
                      <p key={index}>{`${String.fromCharCode(
                        97 + index
                      )}: ${answer}`}</p>
                    ))}
                    <p>Punkty: {question.points}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SearchQuestions;
