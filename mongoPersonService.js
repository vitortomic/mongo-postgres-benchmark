const { Contact, Person } = require('./mongoSetup.js')

const createPerson = async (personDto) => {
    const newContact = new Contact({
        address: personDto.address,
        phoneNumber: personDto.phoneNumber
    })
    const newPerson = new Person({
        firstName: personDto.firstName,
        lastName: personDto.lastName,
        contact: newContact,
        birthDate: new Date('1990-01-01')
    })
    const savedPerson = await newPerson.save()
    console.log('Person saved:', savedPerson)
}

const createPersons = async (persons) => {
    console.time('createPersons')
    createdPersons = await Person.insertMany(persons)
    console.log(`Saved ${createdPersons.length} persons`)
    return {
        createdPersons,
        executionTime: console.timeEnd('createPersons')
      };
}

const deleteAllPersons = async () => {
    result = await Person.deleteMany({})
    console.log(`Deleted ${result.deletedCount} Persons`)
    return result.deletedCount
}

const calculateCollectiveAge = async () => {
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
  
      const collectiveAgeInMilliseconds = result[0]?.collectiveAge || 0;
      const collectiveAgeInSeconds = collectiveAgeInMilliseconds / 1000;
      const collectiveAgeInYears = collectiveAgeInSeconds / (365.25 * 24 * 60 * 60);
  
      console.log('Collective age of all persons:', collectiveAgeInYears.toFixed(2), 'years');
      return collectiveAgeInYears;
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