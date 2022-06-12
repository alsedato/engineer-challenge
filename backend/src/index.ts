import express from 'express';

const app = express();
const port = 4000;

app.use(express.json())

app.use('/api', require('./routes/api.route'));

app.get('/', (req, res) => {
  res.send('Server is up and running 🚀')
})

app.listen(port, () => {
  console.log(`🚀  Server ready at ${port}`);
});
