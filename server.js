const express = require('express')
const { createPerson, createPersons, deleteAllPersons, calculateCollectiveAge } = require('./mongoPersonService.js')
const Chance = require('chance')
const { Pool } = require('pg')
const Knex = require('knex')

const app = express()
const PORT = process.env.PORT || 3000
const chance = new Chance()

const numberOfRecords = 100000

const persons = Array.from({ length: numberOfRecords }, () => ({
  address: chance.address(),
  phoneNumber: chance.phone(),
  firstName: chance.first(),
  lastName: chance.last(),
  birthDate: chance.birthday()
}));

app.use(express.json())
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

app.delete('/persons', async (req, res) => {
  try {
    deletedCount = await deleteAllPersons();
    res.json({
      "deletedCount": deletedCount.deletedCount,
      executionTime: deletedCount.executionTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/persons/getCollectiveAge', async (req, res) => {
  try {
    collectiveAge = await calculateCollectiveAge()
    res.json({
      "collectiveAge": collectiveAge,
      executionTime: collectiveAge.executionTime
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/benchmark', async (req, res) => {
  try {
    createdPersonsMongo = await createPersons(persons)
    console.log(`Create persons execution time ${createdPersonsMongo.executionTime}ms`)
    collectiveAge = await calculateCollectiveAge()
    deleteResponse = await deleteAllPersons()
    response = {
      numberOfRecords,
      'createPersonsExecutionTime': createdPersonsMongo.executionTime,
      'getCollectiveAgeExecutionTime': collectiveAge.executionTime,
      'deleteAllExecutionTime': deleteResponse.executionTime
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

