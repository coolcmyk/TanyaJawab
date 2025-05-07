const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use('/auth', require('./routes/authRoutes'));
app.use('/documents', require('./routes/documentsRoutes'));
app.use('/courses', require('./routes/coursesRoutes'));
app.use('/assignments', require('./routes/assignmentsRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));