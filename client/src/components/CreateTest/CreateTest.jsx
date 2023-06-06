import React, { useContext, useEffect, useState } from 'react';
import './CreateTest.css';
import Navbar from '../Navbar/Navbar';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MultiSelect } from 'react-multi-select-component';
import { toast } from 'react-hot-toast';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import { AiOutlineArrowDown, AiOutlineArrowUp } from 'react-icons/ai';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

function CreateTest() {
  const { user, setUser } = useContext(UserContext);
  const [openPopup, setOpenPopup] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [expandQuestion, setExpandQuestion] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [pdfName, setPdfName] = useState('');
  const [testName, setTestName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [subjectName, setSubjectName] = useState('');
  const [group, setGroup] = useState('');
  const [semester, setSemester] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);

  const navigate = useNavigate();

  const options = [
    { label: 'Nazwa testu', value: 'testName' },
    { label: 'Data', value: 'date' },
    { label: 'Nazwa przedmiotu', value: 'subjectName' },
    { label: 'Semestr', value: 'semester' },
    { label: 'Grupa', value: 'group' },
  ];

  const overrideStrings = {
    selectSomeItems: 'Wybierz kilka elementów',
    selectAll: 'Wybierz wszystkie',
    search: 'Szukaj',
    clearSearch: 'Wyczyść wyszukiwanie',
    noOptions: 'Brak opcji',
    allItemsAreSelected: 'Wszystkie elementy',
    selectAllFiltered: 'Wybierz wszystkie (Filtr)',
  };

  const handlePopup = (e) => {
    setOpenPopup(true);
  };

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

  const handleExpand = (id) => {
    if (id === expandQuestion) {
      setExpandQuestion('');
    } else {
      setExpandQuestion(id);
    }
  };

  const handlePdfName = (e) => {
    setPdfName(e.target.value);
  };

  const handleTestName = (e) => {
    setTestName(e.target.value);
  };

  const handleSubjectName = (e) => {
    setSubjectName(e.target.value);
  };

  const handleGroup = (e) => {
    setGroup(e.target.value);
  };

  const handleSemester = (e) => {
    setSemester(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`/searchQuestions/${user.email}`);
        setQuestions(res.data.questions);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const handleDeleteQuestion = (event, id) => {
    event.stopPropagation();
    const updatedSelectedQuestions = selectedQuestions.filter(
      (questionId) => questionId !== id
    );
    setSelectedQuestions(updatedSelectedQuestions);
  };

  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  const pdfGenerate = async () => {
    const formattedDate = date.split('-').join('.');
    let questionNumber = 1;
    const documentDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: [
        { text: testName.toUpperCase(), alignment: 'center', bold: true },
        { text: `Data: ${formattedDate}`, alignment: 'right' },
        { text: 'Imię i Nazwisko: ', alignment: 'left' },
        {
          text: [
            subjectName && subjectName !== ''
              ? { text: subjectName, alignment: 'right' }
              : null,
            subjectName && subjectName !== '' && semester && semester !== ''
              ? ', '
              : null,
            semester && semester !== ''
              ? { text: 'Semestr ' + semester, alignment: 'right' }
              : null,
          ],
          alignment: 'right',
        },
        group && group !== ''
          ? {
              text: 'Grupa ' + group,
              alignment: 'right',
              margin: [0, 10, 0, 0],
            }
          : null,
        { text: '\n' },
      ],
    };

    selectedQuestions.forEach((questionId) => {
      const question = questions.find((q) => q._id === questionId);
      if (question) {
        const formattedQuestion = `${questionNumber}. ${question.question} (${question.points} pkt)`;
        const formattedAnswers = question.answers
          .map(
            (answer, index) => `  ${String.fromCharCode(97 + index)}. ${answer}`
          )
          .join('\n');

        documentDefinition.content.push({ text: formattedQuestion });
        documentDefinition.content.push({
          text: formattedAnswers,
          margin: [25, 0, 0, 0],
        });
        documentDefinition.content.push({ text: '\n' });

        questionNumber += 1;
      }
    });

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(`${pdfName}.pdf`);

    try {
      const dataToSend = {
        selectedQuestions,
        testName,
        date,
        subjectName,
        group,
        semester,
        pdfName,
        email: user.email,
        active: true,
      };

      await axios.post('/createTest', dataToSend);

      toast.success('Dane zostały zapisane.');
    } catch (error) {
      toast.error('Błąd podczas zapisu danych:', error);
    }
  };

  const isObjectInList = (objectToCheck) => {
    return selectedOptions.some(
      (option) =>
        option.label === objectToCheck.label &&
        option.value === objectToCheck.value
    );
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;

    const updatedSelectedQuestions = [...selectedQuestions];
    const temp = updatedSelectedQuestions[index];
    updatedSelectedQuestions[index] = updatedSelectedQuestions[index - 1];
    updatedSelectedQuestions[index - 1] = temp;

    setSelectedQuestions(updatedSelectedQuestions);
  };

  const handleMoveDown = (index) => {
    if (index === selectedQuestions.length - 1) return;

    const updatedSelectedQuestions = [...selectedQuestions];
    const temp = updatedSelectedQuestions[index];
    updatedSelectedQuestions[index] = updatedSelectedQuestions[index + 1];
    updatedSelectedQuestions[index + 1] = temp;

    setSelectedQuestions(updatedSelectedQuestions);
  };

  useEffect(() => {
    if (selectedQuestions.length === 0) {
      setPdfName('');
    }
  });

  return (
    <div className="CreateTest">
      <Navbar userLogout={handleLogout} />
      <div className="containerCreateTest">
        <MultiSelect
          className="multiSelect"
          options={options}
          value={selectedOptions}
          onChange={setSelectedOptions}
          labelledBy={'Select'}
          isCreatable={false}
          overrideStrings={overrideStrings}
        />
        <div>
          {openPopup && (
            <div className="popup">
              <h2 className="headerAllQuestions">Lista pytań</h2>
              <ul>
                {questions.map((question) => (
                  <li
                    key={question?._id}
                    className={`questionItem ${
                      expandQuestion === question?._id ? 'expanded' : ''
                    }`}
                    onClick={() => handleExpand(question?._id)}
                    data-id={question?._id}
                  >
                    <div className="questionText">{question?.question}</div>
                    {expandQuestion === question?._id && (
                      <div className="questionDetails">
                        {question?.answers.map((answer, index) => (
                          <p key={index}>{`${String.fromCharCode(
                            97 + index
                          )}: ${answer}`}</p>
                        ))}
                        <p>Punkty: {question?.points}</p>
                      </div>
                    )}
                    <span
                      className="addIcon"
                      onClick={(event) => {
                        const questionId = event.currentTarget
                          .closest('li')
                          ?.getAttribute('data-id');
                        if (questionId === question?._id) {
                          event.stopPropagation();
                          //handleExpand(question?._id);
                          if (selectedQuestions.includes(question?._id)) {
                            toast.error('To pytanie zostało już wybrane.');
                          } else {
                            setSelectedQuestions((prevQuestions) => [
                              ...prevQuestions,
                              question?._id,
                            ]);
                          }
                        }
                      }}
                    >
                      <AiOutlinePlusCircle></AiOutlinePlusCircle>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {openPopup && (
            <div className="overlay" onClick={() => setOpenPopup(false)} />
          )}
        </div>
        <div className="pdfsFields">
          <input
            type="text"
            placeholder="Nazwa testu"
            className="testField"
            value={testName}
            onChange={handleTestName}
            disabled={
              !isObjectInList({ label: 'Nazwa testu', value: 'testName' })
            }
          />
          <input
            type="date"
            placeholder="Data"
            className="testField"
            value={date}
            onChange={handleDateChange}
            disabled={!isObjectInList({ label: 'Data', value: 'date' })}
          />
          <input
            type="text"
            placeholder="Nazwa przedmiotu"
            className="testField"
            value={subjectName}
            onChange={handleSubjectName}
            disabled={
              !isObjectInList({
                label: 'Nazwa przedmiotu',
                value: 'subjectName',
              })
            }
          />
          <input
            type="number"
            placeholder="Grupa"
            className="testField"
            value={group}
            onChange={handleGroup}
            disabled={!isObjectInList({ label: 'Grupa', value: 'group' })}
          />
          <input
            type="text"
            placeholder="Semestr"
            className="testField"
            value={semester}
            onChange={handleSemester}
            disabled={!isObjectInList({ label: 'Semestr', value: 'semester' })}
          />
        </div>
        <div className="buttonsDiv">
          <button className="addQuestionButton" onClick={handlePopup}>
            Dodaj pytanie
          </button>
          {selectedQuestions.length > 0 ? (
            <div className="namePdfDiv">
              <input
                type="text"
                placeholder="Nazwa pliku PDF"
                value={pdfName}
                onChange={handlePdfName}
              />
            </div>
          ) : null}
          <button
            className="downloadPdfQuestion"
            disabled={pdfName.trim() === '' || selectedQuestions.length === 0}
            onClick={pdfGenerate}
          >
            Pobierz PDF
          </button>
        </div>
        <div className="allQuestions">
          <ul>
            {selectedQuestions.map((id, index) => {
              const question = questions.find((q) => q?._id === id);
              return (
                <div className="questionItem" key={question?._id}>
                  <li
                    key={question?._id}
                    onClick={() => handleExpand(question?._id)}
                    className={`questionSelected ${
                      expandQuestion === question?._id ? 'expanded' : ''
                    }`}
                  >
                    <div className="questionText">{question?.question}</div>
                    {expandQuestion === question?._id && (
                      <div className="questionDetails">
                        {question?.answers.map((answer, index) => (
                          <p key={index}>{`${String.fromCharCode(
                            97 + index
                          )}: ${answer}`}</p>
                        ))}
                        <p>Punkty: {question?.points}</p>
                      </div>
                    )}
                    <span
                      className="deleteIcon"
                      onClick={(event) =>
                        handleDeleteQuestion(event, question?._id)
                      }
                    >
                      <MdDelete></MdDelete>
                    </span>
                  </li>
                  <div className="moveButtons">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <AiOutlineArrowUp className="arrow"></AiOutlineArrowUp>
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === selectedQuestions.length - 1}
                    >
                      <AiOutlineArrowDown className="arrow"></AiOutlineArrowDown>
                    </button>
                  </div>
                </div>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CreateTest;
