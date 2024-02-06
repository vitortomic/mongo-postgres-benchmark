const { Contact, Person } = require('./mongoSetup.js')
const { performance } = require('perf_hooks')

const createPerson = async (personDto) => {
    const newContact = new Contact({
        address: personDto.address,
        phoneNumber: personDto.phoneNumber
    })
    const newPerson = new Person({
        firstName: personDto.firstName,
        lastName: personDto.lastName,
        contact: newContact,
        birthDate: personDto.birthDate
    })
    const savedPerson = await newPerson.save()
    console.log('Person saved:', savedPerson)
}

const createPersons = async (persons) => {
    const startTime = performance.now()
    createdPersons = await Person.insertMany(persons)
    const endTime = performance.now()
    const executionTime = endTime - startTime
    console.log(`Saved ${createdPersons.length} persons`)
    return {
        createdPersons,
        executionTime: executionTime
      };
}

const deleteAllPersons = async () => {
    const startTime = performance.now()
    result = await Person.deleteMany({})
    const endTime = performance.now()
    const executionTime = endTime - startTime;
    console.log(`Deleted ${result.deletedCount} Persons`)
    return {
        "deletedCount" : result.deletedCount,
        executionTime: executionTime
      };
}

const calculateCollectiveAge = async () => {
    const startTime = performance.now()
    try {
      const result = await Person.aggregate([
        {
          $group: {
            _id: null,
            collectiveAge: { $sum: { $subtract: [new Date(), '$birthDate'] } }
          }
        },
        {
          $project: {
            _id: 0,
            collectiveAge: 1
          }
        }
      ]);
      
      const collectiveAgeInMilliseconds = result[0]?.collectiveAge || 0
      const collectiveAgeInSeconds = collectiveAgeInMilliseconds / 1000
      const collectiveAgeInYears = collectiveAgeInSeconds / (365.25 * 24 * 60 * 60)
      const endTime = performance.now()
      const executionTime = endTime - startTime
   
      console.log('Collective age of all persons:', collectiveAgeInYears.toFixed(2), 'years')
      return {
        collectiveAgeInYears,
        executionTime: executionTime
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };


module.exports = { 
    createPerson, 
    createPersons,
    deleteAllPersons,
    calculateCollectiveAge
}