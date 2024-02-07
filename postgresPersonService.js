const { Pool } = require('pg')
const { performance } = require('perf_hooks')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'admin',
  port: 5433,
})

const createTablesPg = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS person (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        birth_date DATE
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS contact (
        id SERIAL PRIMARY KEY,
        person_id INTEGER REFERENCES person(id),
        address VARCHAR(255),
        phone_number VARCHAR(20)
      )
    `)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating tables:', error.message)
    throw error
  } finally {
    client.release()
  }
}

const createPersonPg = async (personDto) => {

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const personResult = await client.query(
      'INSERT INTO person(first_name, last_name, birth_date) VALUES($1, $2, $3) RETURNING *',
      [personDto.firstName, personDto.lastName, personDto.birthDate]
    )

    const contactResult = await client.query(
      'INSERT INTO contact(person_id, address, phone_number) VALUES($1, $2, $3) RETURNING *',
      [personResult.rows[0].id, personDto.address, personDto.phoneNumber]
    )

    await client.query('COMMIT')

    const savedPerson = { ...personResult.rows[0], contact: contactResult.rows[0] }
    console.log('Person saved:', savedPerson)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating person:', error.message)
    throw error
  } finally {
    client.release()
  }
}

const createPersonsPg = async (persons) => {
  const startTime = performance.now()

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    createdPersons = []
    for (const personDto of persons) {
      const personResult = await client.query(
        'INSERT INTO person(first_name, last_name, birth_date) VALUES($1, $2, $3) RETURNING *',
        [personDto.firstName, personDto.lastName, personDto.birthDate]
      )
      const contactResult = await client.query(
        'INSERT INTO contact(person_id, address, phone_number) VALUES($1, $2, $3) RETURNING *',
        [personResult.rows[0].id, personDto.address, personDto.phoneNumber]
      )
      createdPersons.push({personResult, contactResult})
    }
    
    await client.query('COMMIT')

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log(`Saved ${createdPersons.length} persons`)
    return {
      createdPersons: createdPersons,
      executionTime: executionTime,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating persons:', error.message)
    throw error
  } finally {
    client.release()
  }
}

const createPersonsPgV2 = async (persons) => {
  const startTime = performance.now()

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const createdPersonsResult = await Promise.all(
      persons.map(async (personDto) => {
        const personResult = await client.query(
          'INSERT INTO person(first_name, last_name, birth_date) VALUES($1, $2, $3) RETURNING *',
          [personDto.firstName, personDto.lastName, personDto.birthDate]
        )

        const contactResult = await client.query(
          'INSERT INTO contact(person_id, address, phone_number) VALUES($1, $2, $3) RETURNING *',
          [personResult.rows[0].id, personDto.address, personDto.phoneNumber]
        )

        return { ...personResult.rows[0], contact: contactResult.rows[0] }
      })
    )

    await client.query('COMMIT')

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log(`Saved ${createdPersonsResult.length} persons`)
    return {
      createdPersons: createdPersonsResult,
      executionTime: executionTime,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating persons:', error.message)
    throw error
  } finally {
    client.release()
  }
}

const deleteAllPersonsPg = async () => {
  const startTime = performance.now()
  const client = await pool.connect()
  try {
    const resultContact = await client.query('DELETE FROM contact')
    const resultPerson = await client.query('DELETE FROM person')

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log(`Deleted ${resultContact.rowCount} persons`)
    console.log(`Deleted ${resultPerson.rowCount} contacts`)
    return {
      deletedCount: resultPerson.rowCount,
      executionTime: executionTime,
    }
  } catch (error) {
    console.error('Error deleting persons:', error.message)
    throw error
  } finally {
    client.release()
  }
}

const calculateCollectiveAgePg = async () => {
  const startTime = performance.now()
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT EXTRACT(EPOCH FROM AGE(NOW(), birth_date)) AS collective_age FROM person'
    )

    const collectiveAgeInSeconds = result.rows[0]?.collective_age || 0
    const collectiveAgeInYears = collectiveAgeInSeconds / (365.25 * 24 * 60 * 60)

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log('Collective age of all persons:', collectiveAgeInYears.toFixed(2), 'years')
    return {
      collectiveAgeInYears,
      executionTime: executionTime,
    }
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    client.release()
  }
}

const findPersonsByFirstNamePg = async (firstName) => {
  const startTime = performance.now()
  const client = await pool.connect()
  const query = `
      SELECT 
        person.id,
        person.first_name,
        person.last_name,
        person.birth_date,
        contact.address,
        contact.phone_number
      FROM person
      LEFT JOIN contact ON person.id = contact.person_id
      WHERE person.first_name = $1
    `;

    const result = await client.query(query, [firstName]);
    const endTime = performance.now()
    const executionTime = endTime - startTime
    
    return {
      "persons": result.rows,
      executionTime: executionTime,
    }
}

module.exports = {
  createTablesPg,
  createPersonPg,
  createPersonsPg,
  deleteAllPersonsPg,
  calculateCollectiveAgePg,
  createPersonsPgV2,
  findPersonsByFirstNamePg
}
