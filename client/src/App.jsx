import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import LoginRegister from './components/LoginRegister/LoginRegister';
import PageNotFound from './components/PageNotFound/PageNotFound';
import Scale from './components/Scale/Scale';
import Profile from './components/Profile/Profile';
import AddQuestion from './components/AddQuestion/AddQuestion';
import SearchQuestions from './components/SearchQuestions/SearchQuestions';
import CreateTest from './components/CreateTest/CreateTest';

import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { UserContextProvider } from './context/userContext';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <Router>
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />}></Route>
          <Route path="/scale" element={<Scale />}></Route>
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/add-question" element={<AddQuestion />}></Route>
          <Route path="/search-questions" element={<SearchQuestions />}></Route>
          <Route path="/create-test" element={<CreateTest />}></Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </UserContextProvider>
  );
}

export default App;
