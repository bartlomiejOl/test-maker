const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const { mongoose } = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();

//  database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('Pomyślnie połączono z bazą danych'))
  .catch((err) => console.log('Błąd połączenia z bazą danych', err));

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/', require('./routes/authRoutes'));

const port = 8000;
app.listen(port, () => console.log(`Server działa na porcie ${port}`));
