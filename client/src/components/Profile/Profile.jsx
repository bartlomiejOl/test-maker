import React, { useContext, useEffect, useState } from 'react';
import './Profile.css';
import Navbar from '../Navbar/Navbar';
import { AiOutlineDownload, AiOutlineEdit } from 'react-icons/ai';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { toast } from 'react-hot-toast';

function Profile() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [scale, setScale] = useState(true);
  const [tests, setTests] = useState(false);
  const [userTests, setUserTests] = useState();
  const [userGrades, setUserGrades] = useState();
  const [selectedOptionsTest, setSelectedOptionsTest] = useState([]);
  const [selectedOptionsGrade, setSelectedOptionsGrade] = useState([]);
  const [openPopupTest, setOpenPopupTest] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [openPopupGrade, setOpenPopupGrade] = useState(false);
  const [selectedGradeSystem, setSelectedGradeSystem] = useState(null);

  const handleGradeChange = (e, gradeIndex, field) => {
    const newValue = parseInt(e.target.value, 10);

    setSelectedGradeSystem((prevGradeSystem) => {
      const updatedGrades = { ...prevGradeSystem.grades };
      updatedGrades[gradeIndex][field] = newValue;

      return {
        ...prevGradeSystem,
        grades: updatedGrades,
      };
    });
  };

  const handleScaleDiv = () => {
    setScale(true);
    setTests(false);
  };

  const handleTestsDiv = () => {
    setScale(false);
    setTests(true);
  };

  const handleTestName = (e) => {
    setSelectedTest((prevState) => ({
      ...prevState,
      testName: e.target.value,
    }));
  };

  const handleSystemName = (e) => {
    const newName = e.target.value;
    setSelectedGradeSystem((prevGradeSystem) => ({
      ...prevGradeSystem,
      systemName: newName,
    }));
  };

  const handleSubjectName = (e) => {
    setSelectedTest((prevState) => ({
      ...prevState,
      subjectName: e.target.value,
    }));
  };

  const handleGroup = (e) => {
    setSelectedTest((prevState) => ({
      ...prevState,
      group: e.target.value,
    }));
  };

  const handleSemester = (e) => {
    setSelectedTest((prevState) => ({
      ...prevState,
      semester: e.target.value,
    }));
  };

  const handleDateChange = (e) => {
    setSelectedTest((prevState) => ({
      ...prevState,
      date: e.target.value,
    }));
  };

  const handlePdfName = (e) => {
    setSelectedTest((prevState) => ({
      ...prevState,
      pdfName: e.target.value,
    }));
  };

  const handleEditTest = (test) => {
    setSelectedTest(test);
    setOpenPopupTest(true);
  };

  const handleEditGradeSystem = (grade) => {
    setSelectedGradeSystem(grade);
    setOpenPopupGrade(true);
  };

  const options = [
    { label: 'Aktywne', value: 'active' },
    { label: 'Nieaktywne', value: 'deactive' },
  ];

  const selectedTestDate = selectedTest?.date
    ? new Date(selectedTest.date).toISOString().split('T')[0]
    : '';

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      axios
        .get('/profile', {
          headers: {
            Authorization: token,
          },
        })
        .then(({ data }) => {
          setUser(data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

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

  const getUserTests = async () => {
    try {
      const response = await axios.get(`/tests/${user.email}`);
      const testsData = response.data.tests;
      setUserTests(testsData);
      setSelectedTest(null);
    } catch (error) {
      console.error('Błąd podczas pobierania testów:', error);
    }
  };

  const getUserGrades = async () => {
    try {
      const response = await axios.get(`/grades/${user.email}`);
      const gradesData = response.data.grades;
      setUserGrades(gradesData);
    } catch (error) {
      console.error('Błąd podczas pobierania testów:', error);
    }
  };

  useEffect(() => {
    if (user) {
      getUserTests();
      getUserGrades();
    }
  }, [user]);

  const handleDownloadTest = async (testId) => {
    const findTest = userTests.find((test) => test._id === testId);
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const date = new Date(findTest.date);
    const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '.');
    const documentDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: [
        {
          text: findTest.testName.toUpperCase(),
          alignment: 'center',
          bold: true,
        },
        { text: `Data: ${formattedDate}`, alignment: 'right' },
        { text: 'Imię i Nazwisko: ', alignment: 'left' },
        {
          text: [
            findTest.subjectName && findTest.subjectName !== ''
              ? { text: findTest.subjectName, alignment: 'right' }
              : null,
            findTest.subjectName &&
            findTest.subjectName !== '' &&
            findTest.semester &&
            findTest.semester !== ''
              ? ', '
              : null,
            findTest.semester && findTest.semester !== ''
              ? { text: 'Semestr ' + findTest.semester, alignment: 'right' }
              : null,
          ],
          alignment: 'right',
        },
        findTest.group && findTest.group !== ''
          ? {
              text: 'Grupa ' + findTest.group,
              alignment: 'right',
              margin: [0, 10, 0, 0],
            }
          : null,
        { text: '\n' },
      ],
    };

    findTest.questions.forEach((question, index) => {
      const formattedQuestion = `${index + 1}. ${question.question} (${
        question.points
      } pkt)`;
      const formattedAnswers = question.answers
        .map(
          (answer, answerIndex) =>
            `  ${String.fromCharCode(97 + answerIndex)}. ${answer}`
        )
        .join('\n');

      documentDefinition.content.push({ text: formattedQuestion });
      documentDefinition.content.push({
        text: formattedAnswers,
        margin: [25, 0, 0, 0],
      });
      documentDefinition.content.push({ text: '\n' });
    });

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(`${findTest.pdfName}.pdf`);
  };

  const handleDownloadTestChange = async () => {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const date = new Date(selectedTest.date);
    const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '.');
    const documentDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: [
        {
          text: selectedTest.testName.toUpperCase(),
          alignment: 'center',
          bold: true,
        },
        { text: `Data: ${formattedDate}`, alignment: 'right' },
        { text: 'Imię i Nazwisko: ', alignment: 'left' },
        {
          text: [
            selectedTest.subjectName && selectedTest.subjectName !== ''
              ? { text: selectedTest.subjectName, alignment: 'right' }
              : null,
            selectedTest.subjectName &&
            selectedTest.subjectName !== '' &&
            selectedTest.semester &&
            selectedTest.semester !== ''
              ? ', '
              : null,
            selectedTest.semester && selectedTest.semester !== ''
              ? { text: 'Semestr ' + selectedTest.semester, alignment: 'right' }
              : null,
          ],
          alignment: 'right',
        },
        selectedTest.group && selectedTest.group !== ''
          ? {
              text: 'Grupa ' + selectedTest.group,
              alignment: 'right',
              margin: [0, 10, 0, 0],
            }
          : null,
        { text: '\n' },
      ],
    };

    selectedTest.questions.forEach((question, index) => {
      const formattedQuestion = `${index + 1}. ${question.question} (${
        question.points
      } pkt)`;
      const formattedAnswers = question.answers
        .map(
          (answer, answerIndex) =>
            `  ${String.fromCharCode(97 + answerIndex)}. ${answer}`
        )
        .join('\n');

      documentDefinition.content.push({ text: formattedQuestion });
      documentDefinition.content.push({
        text: formattedAnswers,
        margin: [25, 0, 0, 0],
      });
      documentDefinition.content.push({ text: '\n' });
    });

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(`${selectedTest.pdfName}.pdf`);
  };

  const handleDownloadGrade = async (gradeId) => {
    const findGrade = userGrades.find((grade) => grade._id === gradeId);
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const documentDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: [
        {
          text: 'Skala ocen',
          alignment: 'left',
          bold: true,
          margin: [0, 0, 0, 20],
        },
      ],
    };

    let optionPdfChange = '';

    if (findGrade.option === 'Punkty') {
      optionPdfChange = 'pkt';
    }
    if (findGrade.option === 'Procenty') {
      optionPdfChange = '%';
    }

    findGrade.grades.forEach((grade, index) => {
      const formattedGrade = `Ocena ${index + 1}: ${
        grade.from
      }${optionPdfChange} - ${grade.to}${optionPdfChange}`;
      documentDefinition.content.push({ text: formattedGrade });
      documentDefinition.content.push({ text: '\n' });
    });

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(`${findGrade.systemName}.pdf`);
  };

  const handleDownloadGradeChange = async () => {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const documentDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: [
        {
          text: 'Skala ocen',
          alignment: 'left',
          bold: true,
          margin: [0, 0, 0, 20],
        },
      ],
    };

    let optionPdfChange = '';

    if (selectedGradeSystem.option === 'Punkty') {
      optionPdfChange = 'pkt';
    }
    if (selectedGradeSystem.option === 'Procenty') {
      optionPdfChange = '%';
    }

    for (const gradeIndex in selectedGradeSystem.grades) {
      const grade = selectedGradeSystem.grades[gradeIndex];
      const formattedGrade = `Ocena ${parseInt(gradeIndex) + 1}: ${
        grade.from
      }${optionPdfChange} - ${grade.to}${optionPdfChange}`;
      documentDefinition.content.push({ text: formattedGrade });
      documentDefinition.content.push({ text: '\n' });
    }

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(`${selectedGradeSystem.systemName}.pdf`);
  };

  const handleDeactivateTest = async (testId) => {
    try {
      await axios.put(`/tests/${testId}/deactivate`, { active: false });
      toast.success('Status testu został pomyślnie zmieniony.');
      getUserTests();
    } catch (error) {
      toast.error('Błąd podczas deaktywacji testu:', error);
    }
  };

  const handleActivateTest = async (testId) => {
    try {
      await axios.put(`/tests/${testId}/activate`, { active: true });
      toast.success('Status testu został pomyślnie zmieniony.');
      getUserTests();
    } catch (error) {
      toast.error('Błąd podczas aktywacji testu:', error);
    }
  };

  const handleDeactivateGrade = async (gradeId) => {
    try {
      await axios.put(`/grades/${gradeId}/deactivate`, { active: false });
      toast.success('Status skali został pomyślnie zmieniony.');
      getUserGrades();
    } catch (error) {
      toast.error('Błąd podczas deaktywacji skali:', error);
    }
  };

  const handleActivateGrade = async (gradeId) => {
    try {
      await axios.put(`/grades/${gradeId}/activate`, { active: true });
      toast.success('Status skali został pomyślnie zmieniony.');
      getUserGrades();
    } catch (error) {
      toast.error('Błąd podczas aktywacji skali:', error);
    }
  };

  const updateSytem = async () => {
    const arrayGrades = Object.values(selectedGradeSystem.grades).map(
      (item) => item
    );

    try {
      const updatedData = {
        grades: arrayGrades,
        systemName: selectedGradeSystem.systemName,
      };

      await axios.put(`/grades/${selectedGradeSystem._id}`, updatedData);
      toast.success('Dane zostały zaktualizowane w bazie danych.');
    } catch (error) {
      toast.error('Błąd podczas zapisywania danych:', error);
    }
    getUserGrades();
    setOpenPopupGrade(false);
  };

  const updateTest = async () => {
    try {
      await axios.put(`/tests/${selectedTest._id}`, selectedTest);
      toast.success('Dane zostały zaktualizowane w bazie danych.');
    } catch (error) {
      toast.error('Błąd podczas zapisywania danych:', error);
    }
    getUserTests();
    setOpenPopupTest(false);
  };

  return (
    <div className="Profile">
      <Navbar userLogout={handleLogout} />
      <div className="containerProfile">
        <div className="informationUser">
          {user ? (
            <div className="userData">
              <p className="userName">Nazwa: {user.name}</p>
              <p className="userEmail">Email: {user.email}</p>
            </div>
          ) : (
            <p>Loading user data...</p>
          )}
        </div>
        <div className="pdfsDiv">
          <div className="optionsDiv">
            <div
              className={`scaleDiv ${scale ? 'active' : ''}`}
              onClick={handleScaleDiv}
            >
              Skale ocen
            </div>
            <div className="divider"></div>
            <div
              className={`testsDiv ${tests ? 'active' : ''}`}
              onClick={handleTestsDiv}
            >
              Testy
            </div>
          </div>
          <div className="contentPdfsDiv">
            {scale && (
              <div className="scaleData">
                <Select
                  defaultValue={selectedOptionsGrade}
                  onChange={setSelectedOptionsGrade}
                  options={options}
                  className="statusSelect"
                  placeholder="Wybierz status"
                />
                <ul className="userGradesList">
                  {Array.isArray(userGrades) &&
                    selectedOptionsGrade.value === 'active' &&
                    userGrades
                      .filter((grade) => grade.active === true)
                      .map((grade) => (
                        <li key={grade._id}>
                          <p className="gradeName">{grade.systemName}</p>
                          <div className="actionsDiv">
                            <AiOutlineDownload
                              className="downloadTest"
                              title="Pobierz"
                              onClick={() => handleDownloadGrade(grade._id)}
                            />
                            <AiOutlineEdit
                              className="editTest"
                              title="Edytuj"
                              onClick={() => handleEditGradeSystem(grade)}
                            />
                            <button
                              className="deactivateButton"
                              onClick={() => handleDeactivateGrade(grade._id)}
                            >
                              Dezaktywuj
                            </button>
                          </div>
                        </li>
                      ))}

                  {Array.isArray(userGrades) &&
                    selectedOptionsGrade.value === 'deactive' &&
                    userGrades
                      .filter((grade) => grade.active === false)
                      .map((grade) => (
                        <li key={grade._id}>
                          <p className="gradeName">{grade.systemName}</p>
                          <div className="actionsDiv">
                            <button
                              className="activeButton"
                              onClick={() => handleActivateGrade(grade._id)}
                            >
                              Aktywuj
                            </button>
                          </div>
                        </li>
                      ))}
                </ul>
              </div>
            )}
            <div>
              {openPopupGrade && (
                <div className="popup">
                  <div className="pdfsFields">
                    <input
                      type="text"
                      placeholder="Nazwa systemu"
                      className="nameSystem"
                      value={selectedGradeSystem?.systemName || ''}
                      onChange={handleSystemName}
                    />
                    {Object.keys(selectedGradeSystem.grades).map(
                      (gradeIndex) => (
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
                              value={
                                selectedGradeSystem.grades[gradeIndex]?.from
                              }
                              onChange={(e) =>
                                handleGradeChange(e, gradeIndex, 'from')
                              }
                              style={{
                                padding: 10,
                                width: 70,
                                borderRadius: 15,
                              }}
                            />
                            <span>-</span>
                            <input
                              type="number"
                              placeholder="Do ilu"
                              value={selectedGradeSystem.grades[gradeIndex]?.to}
                              onChange={(e) =>
                                handleGradeChange(e, gradeIndex, 'to')
                              }
                              style={{
                                padding: 10,
                                width: 70,
                                borderRadius: 15,
                              }}
                            />
                          </form>
                        </div>
                      )
                    )}
                  </div>
                  <div className="popupButtons">
                    <button
                      className="popupDownload"
                      onClick={handleDownloadGradeChange}
                    >
                      Pobierz
                    </button>
                    <button className="popupSave" onClick={updateSytem}>
                      Edytuj
                    </button>
                  </div>
                </div>
              )}
              {openPopupGrade && (
                <div
                  className="overlay"
                  onClick={() => setOpenPopupGrade(false)}
                />
              )}
            </div>
            {tests && (
              <div className="testsData">
                <Select
                  defaultValue={selectedOptionsTest}
                  onChange={setSelectedOptionsTest}
                  options={options}
                  className="statusSelect"
                  placeholder="Wybierz status"
                />
                <ul className="userTestsList">
                  {selectedOptionsTest.value === 'active' &&
                    userTests
                      .filter((test) => test.active === true)
                      .map((test) => (
                        <li key={test._id}>
                          <p className="testName">{test.pdfName}</p>
                          <div className="actionsDiv">
                            <AiOutlineDownload
                              className="downloadTest"
                              title="Pobierz"
                              onClick={() => handleDownloadTest(test._id)}
                            />
                            <AiOutlineEdit
                              className="editTest"
                              title="Edytuj"
                              onClick={() => handleEditTest(test)}
                            />
                            <button
                              className="deactivateButton"
                              onClick={() => handleDeactivateTest(test._id)}
                            >
                              Dezaktywuj
                            </button>
                          </div>
                        </li>
                      ))}

                  {selectedOptionsTest.value === 'deactive' &&
                    userTests
                      .filter((test) => test.active === false)
                      .map((test) => (
                        <li key={test._id}>
                          <p className="testName">{test.pdfName}</p>
                          <div className="actionsDiv">
                            <button
                              className="activeButton"
                              onClick={() => handleActivateTest(test._id)}
                            >
                              Aktywuj
                            </button>
                          </div>
                        </li>
                      ))}
                </ul>
              </div>
            )}
            <div>
              {openPopupTest && (
                <div className="popup">
                  <div className="pdfsFields">
                    <input
                      type="text"
                      placeholder="Nazwa testu"
                      className="testField"
                      value={selectedTest?.testName || ''}
                      onChange={handleTestName}
                    />
                    <input
                      type="date"
                      placeholder="Data"
                      className="testField"
                      value={selectedTestDate || ''}
                      onChange={handleDateChange}
                    />
                    <input
                      type="text"
                      placeholder="Nazwa przedmiotu"
                      className="testField"
                      value={selectedTest?.subjectName || ''}
                      onChange={handleSubjectName}
                    />
                    <input
                      type="number"
                      placeholder="Grupa"
                      className="testField"
                      value={selectedTest?.group || ''}
                      onChange={handleGroup}
                    />
                    <input
                      type="text"
                      placeholder="Semestr"
                      className="testField"
                      value={selectedTest?.semester || ''}
                      onChange={handleSemester}
                    />
                    <input
                      type="text"
                      placeholder="Nazwa PDF"
                      className="testField"
                      value={selectedTest?.pdfName || ''}
                      onChange={handlePdfName}
                    />
                  </div>
                  <div className="popupButtons">
                    <button
                      className="popupDownload"
                      onClick={handleDownloadTestChange}
                    >
                      Pobierz
                    </button>
                    <button className="popupSave" onClick={updateTest}>
                      Edytuj
                    </button>
                  </div>
                </div>
              )}
              {openPopupTest && (
                <div
                  className="overlay"
                  onClick={() => setOpenPopupTest(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
