import React, { useContext, useEffect, useState } from 'react';
import './AddQuestion.css';
import Navbar from '../Navbar/Navbar';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function AddQuestion() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [dataQuestion, setDataQuestion] = useState({
    email: user?.email,
    question: '',
    answers: ['', '', '', ''],
    points: 0,
  });

  useEffect(() => {
    if (!user) {
      axios
        .get('/profile')
        .then(({ data }) => {
          setUser(data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [user, setUser]);

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

  const addQuestion = async (event) => {
    event.preventDefault();

    const { email, question, answers, points } = dataQuestion;

    if (dataQuestion.answers.length === 0) {
      toast.error('Proszę wprowadzić liczbę odpowiedzi większą niż 0.');
      return;
    }

    const encodedEmail = encodeURIComponent(email);
    const encodedQuestion = encodeURIComponent(question);

    try {
      const { data } = await axios.get(
        `/questionExists/${encodedEmail}/${encodedQuestion}`
      );
      if (data.exists) {
        toast.error('Pytanie o tej nazwie już istnieje w bazie danych.');
      } else {
        const response = await axios.post('/addQuestion', {
          email,
          question,
          answers,
          points,
        });

        if (response.data.error) {
          toast.error(response.data.error);
        } else {
          setDataQuestion({
            email: user?.email,
            question: '',
            answers: ['', '', '', ''],
            points: 0,
          });
          toast.success('Pytanie zostało dodane.');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Wystąpił błąd podczas dodawania pytania.');
    }
  };

  const handleAnswersNumberChange = (e) => {
    const answersCount = parseInt(e.target.value, 10);
    const answers = dataQuestion.answers.slice(0, answersCount);

    if (answersCount > answers.length) {
      for (let i = answers.length; i < answersCount; i++) {
        answers.push('');
      }
    }

    setDataQuestion({ ...dataQuestion, answers });
  };

  const handleAnswerChange = (e, index) => {
    const { value } = e.target;
    const newAnswers = [...dataQuestion.answers];
    newAnswers[index] = value;
    setDataQuestion({ ...dataQuestion, answers: newAnswers });
  };

  return (
    <div className="AddQuestion">
      <Navbar userLogout={handleLogout} />
      <div className="containerQuestion">
        <div className="formDiv">
          <form className="questionForm" onSubmit={addQuestion}>
            <div>
              <label>Email: </label>
              <input
                type="email"
                placeholder="Email"
                value={dataQuestion.email}
                onChange={(e) =>
                  setDataQuestion({ ...dataQuestion, email: e.target.value })
                }
              />
            </div>
            <div>
              <label>Pytanie: </label>
              <textarea
                type="text"
                placeholder="Pytanie"
                value={dataQuestion.question}
                onChange={(e) =>
                  setDataQuestion({ ...dataQuestion, question: e.target.value })
                }
              />
            </div>
            <div>
              <label>Ile odpowiedzi: </label>
              <input
                type="text"
                placeholder="Ile odpowiedzi"
                value={dataQuestion.answers.length}
                onChange={handleAnswersNumberChange}
                pattern="^[0-9]+$"
              />
            </div>
            {dataQuestion.answers.map((answer, index) => (
              <div key={index}>
                <label>{`Odpowiedź ${String.fromCharCode(
                  65 + index
                )}: `}</label>
                <textarea
                  type="text"
                  placeholder={`Odpowiedź ${String.fromCharCode(65 + index)}`}
                  value={answer}
                  onChange={(e) => handleAnswerChange(e, index)}
                />
              </div>
            ))}
            <div>
              <label>Punkty: </label>
              <input
                type="number"
                placeholder="Punkty"
                value={dataQuestion.points}
                onChange={(e) =>
                  setDataQuestion({ ...dataQuestion, points: e.target.value })
                }
              />
            </div>
            <input type="submit" className="submitQuestion" />
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddQuestion;
