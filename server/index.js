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
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://test-maker.netlify.app');
  res.header(
    'Access-Control-Allow-Origin',
    'https://test-maker-hcto.onrender.com'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/', require('./routes/authRoutes'));

const port = 8000;
app.listen(port, () => console.log(`Server działa na porcie ${port}`));
