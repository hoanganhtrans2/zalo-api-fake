const express = require('express');
const app = express();
const bodyParser = require('body-parser');


const port = 3000;
const userRoutes = require('./routes/users.routes');
const loginRoutes = require('./routes/login.routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/user', userRoutes);


app.use('/api',userRoutes);
app.use('/api',userRoutes);

app.use('/api', loginRoutes);



app.listen(port, () => {
  console.log(`Api listening at http://localhost:${port}`)
});