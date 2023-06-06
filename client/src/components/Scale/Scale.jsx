import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { UserContext } from '../../context/userContext';
import './Scale.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';

function Scale() {
  const options = [
    { value: 'percent', label: 'Procenty' },
    { value: 'point', label: 'Punkty' },
  ];

  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [gradesData, setGradesData] = useState({});
  const [pdfName, setPdfName] = useState('');
  const [amountOfPoints, setAmountOfPoints] = useState();
  const [selectedOption, setSelectedOption] = useState(options[1]);
  const [userGrades, setUserGrades] = useState([]);
  const [selectedOptionGrade, setSelectedOptionGrade] = useState(userGrades[1]);
  const [openPopupReset, setOpenPopupReset] = useState(false);
  const [openPopupAdd, setOpenPopupAdd] = useState(false);
  const [nameSystem, setNameSystem] = useState();
  const [data, setData] = useState({
    numberOfGrades: '',
  });
  const [userSystemGrades, setUserSystemGrades] = useState();
  const [selectedGradeSystem, setSelectedGradeSystem] = useState();

  const handlePopupAdd = (e) => {
    setOpenPopupAdd(true);
  };

  const handlePdfName = (e) => {
    setPdfName(e.target.value);
  };

  const handleAmountOfPoints = (e) => {
    setAmountOfPoints(e.target.value);
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

  const handleGradesNumberChange = (e) => {
    const numberOfGrades = parseInt(e.target.value, 10);
    const grades = {};

    for (let i = 0; i < numberOfGrades; i++) {
      grades[i] = {
        from: '',
        to: '',
      };
    }

    setGradesData(grades);

    setData({
      ...data,
      numberOfGrades: numberOfGrades.toString(),
    });
  };

  const handleGradeChange = (e, gradeIndex, field) => {
    const { value } = e.target;
    const newValue = !isNaN(parseInt(value)) ? value : '';

    const newGradesData = {
      ...gradesData,
      [gradeIndex]: {
        ...gradesData[gradeIndex],
        [field]: newValue,
      },
    };

    setGradesData(newGradesData);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const pdfGenerate = async () => {
    const doc = new jsPDF('landscape', 'px', 'a4', 'false');
    doc.setFont('Helvertica');
    let yPosition = 100;
    let previousTo = 0;
    for (const key in selectedGradeSystem.grades) {
      const grade = selectedGradeSystem.grades[key];
      const gradeIndex = parseInt(key) + 1;
      doc.text(60, 60, 'Skala ocen:');
      if (selectedGradeSystem.option === 'Punkty') {
        doc.text(
          60,
          yPosition,
          `Ocena ${gradeIndex}: ${grade.from}pkt  -  ${grade.to}pkt`
        );
      }
      if (selectedGradeSystem.option === 'Procenty') {
        const from = previousTo + 1;
        const to = Math.ceil((grade.to / 100) * amountOfPoints);

        doc.text(60, yPosition, `Ocena ${gradeIndex}: ${from}pkt  -  ${to}pkt`);

        previousTo = to;
      }

      yPosition = yPosition + 20;
    }
    doc.save(`${pdfName}.pdf`);
  };

  const handleSaveGrades = async () => {
    const convertedGradesData = Object.values(gradesData).map((grade) => ({
      from: parseInt(grade.from),
      to: parseInt(grade.to),
    }));

    try {
      const { data } = await axios.get(
        `/gradeExists/${user.email}/${nameSystem}`
      );

      if (data.exists) {
        toast.error('System ocen o tej nazwie już istnieje w bazie danych.');
        return;
      }

      const postData = {
        systemName: nameSystem,
        option: selectedOption.label,
        email: user.email,
        active: true,
        grades: convertedGradesData,
      };

      await axios.post('/grades', postData);
      toast.success('Dane zostały zapisane w bazie danych.');
    } catch (error) {
      toast.error('Błąd podczas zapisywania danych:', error);
    }

    setOpenPopupAdd(false);
  };

  const getUserGrades = async () => {
    try {
      const response = await axios.get(`/grades/${user.email}`);
      const gradesData = response.data.grades;
      const activeGrades = gradesData.filter((grade) => grade.active === true);
      const formattedGrades = activeGrades.map((grade) => ({
        value: grade.systemName,
        label: grade.systemName,
      }));
      setUserGrades(formattedGrades);
      setUserSystemGrades(gradesData);
    } catch (error) {
      console.error('Błąd podczas pobierania testów:', error);
    }
  };

  useEffect(() => {
    if (user) {
      getUserGrades();
    }
  }, [user]);

  const findGradeSystemByName = (name) => {
    if (Array.isArray(userSystemGrades)) {
      return userSystemGrades.find((system) => system.systemName === name);
    }
    return 'x';
  };

  useEffect(() => {
    if (selectedOptionGrade) {
      const selected = findGradeSystemByName(selectedOptionGrade.value);
      setSelectedGradeSystem(selected);
    }
  }, [selectedOptionGrade]);

  return (
    <div className="Scale">
      <Navbar userLogout={handleLogout} />
      <div className="containerScale">
        <h1 className="headerScale">Generator skali</h1>
        <button className="addNewSystemButton" onClick={handlePopupAdd}>
          Dodaj nowy system oceniania
        </button>
        <div>
          {openPopupAdd && (
            <div className="popup">
              <h2 className="headerAdd">Dodawanie nowego systemu oceniania</h2>
              <div className="newSytemDiv">
                <input
                  type="number"
                  className="numberOfGrades"
                  placeholder="Ilość ocen"
                  value={data.numberOfGrades}
                  onChange={handleGradesNumberChange}
                ></input>
                <input
                  type="text"
                  className="nameSystem"
                  placeholder="Nazwa systemu"
                  value={nameSystem}
                  onChange={(e) => setNameSystem(e.target.value)}
                ></input>
                <Select
                  defaultValue={selectedOption}
                  onChange={setSelectedOption}
                  options={options}
                />
              </div>
              <div className="gradesDiv">
                {Object.keys(gradesData).map((gradeIndex) => (
                  <div
                    key={gradeIndex}
                    className={`grade-${parseInt(gradeIndex) + 1}`}
                    style={{
                      backgroundColor: 'white',
                      padding: 15,
                      width: 500,
                      display: 'flex',
                      justifyContent: 'space-evenly',
                      alignItems: 'center',
                      borderRadius: 15,
                    }}
                  >
                    <h4>Ocena {parseInt(gradeIndex) + 1}</h4>
                    <form className="formGrades">
                      <input
                        type="number"
                        placeholder="Od ilu"
                        value={gradesData[gradeIndex]?.from}
                        onChange={(e) =>
                          handleGradeChange(e, gradeIndex, 'from')
                        }
                        style={{ padding: 10, width: 70, borderRadius: 15 }}
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Do ilu"
                        value={gradesData[gradeIndex]?.to}
                        onChange={(e) => handleGradeChange(e, gradeIndex, 'to')}
                        style={{ padding: 10, width: 70, borderRadius: 15 }}
                      />
                    </form>
                  </div>
                ))}
              </div>
              <button className="saveButton" onClick={handleSaveGrades}>
                Zapisz
              </button>
            </div>
          )}
          {openPopupAdd && (
            <div className="overlay" onClick={() => setOpenPopupAdd(false)} />
          )}
        </div>
        <div className="pdfDiv">
          <input
            type="number"
            placeholder="Podaj ilość punktów"
            value={amountOfPoints}
            onChange={handleAmountOfPoints}
          ></input>
          <Select
            value={selectedOptionGrade}
            onChange={setSelectedOptionGrade}
            options={userGrades}
            placeholder="Wybierz system"
          />
          <input
            type="text"
            placeholder="Podaj nazwe pliku"
            value={pdfName}
            onChange={handlePdfName}
          ></input>
          <button
            className="downloadPdf"
            onClick={pdfGenerate}
            disabled={
              pdfName.trim() === '' || !amountOfPoints || !selectedGradeSystem
            }
          >
            Pobierz PDF
          </button>
        </div>
      </div>
      <div>
        {openPopupReset && (
          <div className="popup">
            <h2>Czy na pewno chcesz zresetować skalę?</h2>
            <div className="popupButtons">
              <button
                className="popupNo"
                onClick={() => setOpenPopupReset(false)}
              >
                Anuluj
              </button>
              <button className="popupYes" onClick={handleRefresh}>
                Zresetuj
              </button>
            </div>
          </div>
        )}
        {openPopupReset && (
          <div className="overlay" onClick={() => setOpenPopupReset(false)} />
        )}
      </div>
    </div>
  );
}

export default Scale;
