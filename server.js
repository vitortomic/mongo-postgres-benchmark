const express = require('express')
const { createPerson, createPersons, deleteAllPersons, calculateCollectiveAge } = require('./mongoPersonService.js')
const { createTablesPg, createPersonPg, createPersonsPg, deleteAllPersonsPg, calculateCollectiveAgePg } = require('./postgresPersonService.js')
const { createPersonNeo4j, createPersonsNeo4j, deleteAllNodes, calculateCollectiveAgeNeo4j } = require('./neo4jPersonService.js')
const Chance = require('chance')
const { randomUUID } = require('crypto');

const app = express()
const PORT = process.env.PORT || 3000
const chance = new Chance()


app.use(express.json())
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

app.delete('/persons', async (req, res) => {
  try {
    deletedCount = await deleteAllPersons()
    res.json({
      "deletedCount": deletedCount.deletedCount,
      executionTime: deletedCount.executionTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
});

app.delete('/personsPg', async (req, res) => {
  try {
    deletedCount = await deleteAllPersonsPg();
    res.json({
      "deletedCount": deletedCount.deletedCount,
      executionTime: deletedCount.executionTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message })
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
    res.status(500).json({ error: error.message })
  }
});

app.get('/persons/getCollectiveAgePg', async (req, res) => {
  try {
    collectiveAge = await calculateCollectiveAgePg()
    res.json({
      "collectiveAge": collectiveAge,
      executionTime: collectiveAge.executionTime
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
});

app.delete('/deleteAll', async (req, res) => {
  try {
    deletedCountPg = await deleteAllPersonsPg()
    deletedCountMongo = await deleteAllPersons()
    deleteResponseNeo4j = await deleteAllNodes()
    res.json({
      "deleteExecutionTimePg": deletedCountPg.executionTime,
      "deleteExecutionTimeMongo": deletedCountMongo.executionTime,
      "deleteExecutionTimeNeo4j": deleteResponseNeo4j.executionTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
});

app.get('/benchmark/:numberOfRecords', async (req, res) => {
  try {
    const numberOfRecords = parseInt(req.params.numberOfRecords)

    if (isNaN(numberOfRecords) || numberOfRecords <= 0) {
      return res.status(400).json({ error: 'Invalid number!' });
    }

    const persons = Array.from({ length: numberOfRecords }, () => ({
      id: randomUUID(),
      address: chance.address(),
      phoneNumber: chance.phone(),
      firstName: chance.first(),
      lastName: chance.last(),
      birthDate: chance.birthday()
    }));

    createdPersonsMongo = await createPersons(persons)
    collectiveAgeMongo = await calculateCollectiveAge()
    //deleteResponseMongo = await deleteAllPersons()

    await createTablesPg()
    createdPersonsPg = await createPersonsPg(persons)
    collectiveAgePg = await calculateCollectiveAgePg()
    //deleteResponsePg = await deleteAllPersonsPg()

    createdPersonsNeo4j = await createPersonsNeo4j(persons)
    collectiveAgeNeo4j = await calculateCollectiveAgeNeo4j()
    //deleteResponseNeo4j = await deleteAllNodes()

    response = {
      numberOfRecords,
      'createPersonsExecutionTimeMongo': createdPersonsMongo.executionTime,
      'getCollectiveAgeExecutionTimeMongo': collectiveAgeMongo.executionTime,
      //'deleteAllExecutionTimeMongo': deleteResponseMongo.executionTime,
      'createPersonsExecutionTimePg': createdPersonsPg.executionTime,
      'getCollectiveAgeExecutionTimePg': collectiveAgePg.executionTime,
      //'deleteAllExecutionTimePg': deleteResponsePg.executionTime,
      'createPersonsExecutionTimeNeo4j': createdPersonsNeo4j.executionTime,
      'getCollectiveAgeExecutionTimeNeo4j': collectiveAgeNeo4j.executionTime,
      //'deleteAllExecutionTimeNeo4j': deleteResponseNeo4j.executionTime
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
});

