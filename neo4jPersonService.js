const neo4j = require('neo4j-driver')
const { performance } = require('perf_hooks')

const driver = neo4j.driver(
  'bolt://localhost:7687', 
  neo4j.auth.basic('neo4j', '12345678')
);

const session = driver.session();


const createPersonNeo4j = async (personDto) => {
  
  const result = await session.writeTransaction(async (tx) => {
    const createPersonQuery = `
      CREATE (p:Person {firstName: $firstName, lastName: $lastName, birthDate: $birthDate})
      RETURN p
    `;
    const person = {
      firstName: personDto.firstName,
      lastName: personDto.lastName,
      birthDate: personDto.birthDate.toISOString(),
    }
  
    const createPersonResult = await tx.run(createPersonQuery, person);

    const createContactQuery = `
    CREATE (c:Contact {address: $address, phoneNumber: $phoneNumber})
    RETURN c
    `;

    const contact = {
      address: personDto.address,
      phoneNumber: personDto.phoneNumber
    }

    const createContactResult = await tx.run(createContactQuery, contact);

    await tx.run(
      `
      MATCH (p:Person {id: $personId}), (c:Contact {id: $contactId})
      CREATE (p)-[:HAS_CONTACT]->(c)
      `,
      {
        personId: neo4j.int(personDto.id),
        contactId: neo4j.int(personDto.contact.id),
      }
    );
  
    return createPersonResult.records[0].get('p').properties;
  });
}

const createPersonsNeo4j = async (persons) => {
  const startTime = performance.now();

  for (const personDto of persons) {
    const query = `CREATE (p:Person { firstName: $firstName, lastName: $lastName, birthDate: $birthDate})-[:HAS_CONTACT]->(c:Contact {address: $address, phoneNumber: $phoneNumber})`

    const parameters = {}
    parameters['firstName'] = personDto.firstName;
    parameters['lastName'] = personDto.lastName;
    parameters['birthDate'] = personDto.birthDate.toISOString();
    parameters['address'] = personDto.address;
    parameters['phoneNumber'] = personDto.phoneNumber;
      
    const result = await session.writeTransaction(async (tx) => {
      await tx.run(query, parameters);
    });
  }
  
  const endTime = performance.now();
  const executionTime = endTime - startTime;

  console.log(`Saved ${persons.length} persons`);
  return {
    createdPersons: persons,
    executionTime: executionTime,
  };
}
  

const deleteAllNodes = async () => {
  const startTime = performance.now();
  const session = driver.session();

  try {
    await session.writeTransaction(async (tx) => {
      await tx.run('MATCH (n) DETACH DELETE n');
    });

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    console.log(`Deleted all nodes`);
    return {
      executionTime: executionTime,
    };
  } finally {
    await session.close();
  }
};

const calculateCollectiveAgeNeo4j = async () => {
  const startTime = performance.now();
  const session = driver.session();

  try {
    const result = await session.readTransaction(async (tx) => {
      const collectiveAgeResult = await tx.run(`
      MATCH (p:Person)
      WITH toInteger(duration.inSeconds(datetime(p.birthDate), datetime()).seconds) AS ageInSeconds
      RETURN REDUCE(s = 0, age IN COLLECT(ageInSeconds) | s + age) AS collectiveAgeInSeconds;
      `);

      const collectiveAgeInSeconds = Number(collectiveAgeResult.records[0].get('collectiveAgeInSeconds'));
      const collectiveAgeInYears = collectiveAgeInSeconds / (365.25 * 24 * 60 * 60);

      return {
        collectiveAgeInYears,
      };
    });

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    console.log('Collective age of all persons:', result.collectiveAgeInYears.toFixed(2), 'years');
    return {
      collectiveAgeInYears: result.collectiveAgeInYears,
      executionTime: executionTime,
    };
  } finally {
    await session.close();
  }
};

module.exports = {
  createPersonNeo4j,
  createPersonsNeo4j,
  deleteAllNodes,
  calculateCollectiveAgeNeo4j
}
