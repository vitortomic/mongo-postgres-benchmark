const express = require('express')
const { createPerson, createPersons, deleteAllPersons, calculateCollectiveAge } = require('./mongoPersonService.js')
const Chance = require('chance')
const { Pool } = require('pg')
const Knex = require('knex')

const app = express()
const PORT = process.env.PORT || 3000
const chance = new Chance()

const numberOfRecords = 1000000

const persons = Array.from({ length: numberOfRecords }, () => ({
  address: chance.address(),
  phoneNumber: chance.phone(),
  firstName: chance.first(),
  lastName: chance.last(),
  birthDate: chance.birthday()
}));

const createdPersonsMongo = createPersons(persons)
console.log(`Create persons execution time ${createdPersonsMongo.executionTime}ms`)

app.use(express.json())
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

app.delete('/persons', async (req, res) => {
  try {
    console.time('deletePersons')
    deletedCount = await deleteAllPersons();
    res.json({
      "deletedCount": deletedCount,
      executionTime: console.timeEnd('deletePersons')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/persons/getCollectiveAge', async (req, res) => {
  try {
    console.time('getCollectiveAge')
    collectiveAge = await calculateCollectiveAge()
    res.json({
      "collectiveAge": collectiveAge,
      executionTime: console.timeEnd('getCollectiveAge')
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





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



