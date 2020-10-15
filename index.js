const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var cors = require('cors');


const port = 3000;
const userRoutes = require('./routes/users.routes');
const loginRoutes = require('./routes/login.routes');

require('dotenv').config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/user', userRoutes);


app.use('/api',userRoutes);
app.use('/api',userRoutes);

app.use('/api', loginRoutes);



app.listen(port, () => {
  console.log(`Api listening at http://localhost:${port}`)
});