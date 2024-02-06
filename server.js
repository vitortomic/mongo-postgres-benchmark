const express = require('express')
const { createPerson, deleteAllPersons } = require('./mongoPersonService.js')
const Chance = require('chance')
const { Pool } = require('pg')
const Knex = require('knex')

const app = express()
const PORT = process.env.PORT || 3000
const chance = new Chance()

const numberOfRecords = 10000

for (let index = 0; index < numberOfRecords; index++) {
  createPerson({
    address: chance.address(),
    phoneNumber: chance.phone(),
    firstName: chance.first(),
    lastName: chance.last(),
    birthDate: chance.birthday()
  })
}

deleteAllPersons();

app.use(express.json())
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})































/*
// PostgreSQL setup
const pgPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'benchmark_postgresql',
  password: 'admin',
  port: 5433
});
const knex = Knex({
  client: 'pg',
  connection: {
    user: 'postgres',
    host: 'localhost',
    database: 'benchmark_postgresql',
    password: 'admin',
    port: 5433
  }
});
*/

/*
// Routes for MongoDB
app.post('/mongodb/hotels', async (req, res) => {
  try {
    const { name, location, rooms } = req.body;
    const hotel = new MongodbHotel({ name, location, rooms });
    await hotel.save();
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/mongodb/hotels', async (req, res) => {
  try {
    const hotels = await MongodbHotel.find();
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/
/*
// Routes for PostgreSQL
app.post('/postgresql/hotels', async (req, res) => {
  try {
    const { name, location, rooms } = req.body;
    const hotel = await knex('hotels').insert({ name, location, rooms }).returning('*');
    res.json(hotel[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/postgresql/hotels', async (req, res) => {
  try {
    const hotels = await knex('hotels').select('*');
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});*/



