const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/benchmark_mongodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 100000,
  serverSelectionTimeoutMS: 100000
})

const contactSchema = new mongoose.Schema({
  address: String,
  phoneNumber: String
})

const Contact = mongoose.model('Contact', contactSchema)

const personSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  contact: contactSchema,
  birthDate: Date
})

const Person = mongoose.model('Person', personSchema)

module.exports = {
    Contact,
    Person
}
