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

const deleteAllPersons = async () => {
    result = await Person.deleteMany({})
    console.log(`Deleted ${result.deletedCount} Persons`)
    return result.deletedCount
}


module.exports = { 
    createPerson, 
    deleteAllPersons 
}