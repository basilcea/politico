/* eslint-disable comma-dangle */
/* eslint-disable func-names */
import pool from '../migrate';
import seed from '../helpers/seed';
import candidates from '../seed/candidates';
import users from '../seed/users';
import offices from '../seed/offices';
import parties from '../seed/parties';
import votes from '../seed/votes';
import petitions from '../seed/petitions';
import interests from '../seed/interests';

/**
* Delete user table
* @async
* @function dropUserTable
* @return {Promise<string>} user table deleted
*/
export const dropUserTable = async function () {
  try {
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('User table deleted');
  } catch (err) {
    console.log(err);
  }
};
/**
* Create user table
* @async
* @function createUserTable
* @return {Promise<string>} user table created
*/

// eslint-disable-next-line func-names
export const createUserTable = async function () {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
        id Serial PRIMARY KEY,
        firstname VARCHAR(20) not null,
        lastname VARCHAR(20),
        othername VARCHAR(30),
        email VARCHAR(40) UNIQUE not null,
        phoneNumber VARCHAR(11) not null,
        passportUrl TEXT,
        password VARCHAR(255) UNIQUE not null,
        registerAs text not null,
        isAdmin BOOLEAN Default false
      )`);
    console.log('User table created');
   
  } catch (err) {
    console.log(err);
  }
};
/**
* Delete party table
* @async
* @function dropPartyTable
* @return {Promise<string>} party table deleted
*/
export const dropPartyTable = async function () {
  try {
    await pool.query('DROP TABLE IF EXISTS parties CASCADE');
    console.log('party table deleted');
  } catch (err) {
    console.log(err);
  }
};
/**
* Create party table
* @async
* @function createUserTable
* @return {Promise<string>} party table created
*/
export const createPartyTable = async function () {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS parties(
          id Serial PRIMARY KEY,
          name VARCHAR(50) not null,
          hqAddress VARCHAR(400) not null,
          logoUrl TEXT not null
        )`
    );
    console.log('Party table created');
  
  } catch (err) {
    console.log(err);
  }
};

/**
* Delete vote table
* @async
* @function dropVoteTable
* @return {Promise<string>} votes table deleted
*/
export const dropVoteTable = async function () {
  try {
    await pool.query('DROP TABLE IF EXISTS votes CASCADE');
    console.log('votes table deleted');
  } catch (err) {
    console.log(err);
  }
};

/**
* Create vote table
* @async
* @function createVoteTable
* @return {Promise<string>} votes table created
*/

export const createVoteTable = async function () {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS votes(
        id serial unique,
        createdOn timestamp Default Current_timeStamp,
        createdBy Integer references users(id) ON DELETE CASCADE not null,
        office Integer references offices(id) On DELETE CASCADE  not null,
        candidate Integer references candidates(id) ON DELETE CASCADE not null,
        Constraint votes_id_pkey  PRIMARY KEY (createdBy, office)
      )`);
    console.log('Votes table created');
 
  } catch (err) {
    console.log(err);
  }
};
/**
* Delete Office table
* @async
* @function dropOfficeTable
* @return {Promise<string>} offices table deleted
*/

export const dropOfficeTable = async function () {
  try {
    await pool.query('DROP TABLE IF EXISTS offices CASCADE');
    console.log('offices table deleted');
  } catch (err) {
    console.log(err);
  }
};
/**
* Create Office table
* @async
* @function createOfficeTable
* @return {Promise<string>} offices table deleted
*/

export const createOfficeTable = async function () {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS offices(
        id serial PRIMARY KEY,
        type varchar(255) not null,
        name varchar(255) not null,
        electDate date
      )`);
    console.log('offices table created');
  
  } catch (err) {
    console.log(err);
  }
};


/**
* Delete interest table
* @async
* @function dropInterestTable
* @return {Promise<string>} interests table deleted
*/

export const dropInterestTable = async function () {
  try {
    await pool.query('DROP TABLE IF EXISTS interests CASCADE');
    console.log('interest table deleted');
  } catch (err) {
    console.log(err);
  }
};


/**
* Create interest table
* @async
* @function createInterestTable
* @return {Promise<string>} interests table created
*/

export const createInterestTable = async function () {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interests(
        id serial Unique,
        office integer references offices(id) ON DELETE CASCADE not null,
        party integer references parties(id) ON DELETE CASCADE not null,
        interest integer references users(id) ON DELETE CASCADE not null,
        Constraint interest_id_pkey PRIMARY KEY (id , interest)
      )`);
    console.log('interest table created');
    
  } catch (err) {
    console.log(err);
  }
};

/**
* Delete Candidate table
* @async
* @function dropCandidateTable
* @return {Promise<string>} candidates table deleted
*/

export const dropCandidateTable = async function () {
  try {
    await pool.query('DROP TABLE IF EXISTS candidates CASCADE');
    console.log('candidates table deleted');
  } catch (err) {
    console.log(err);
  }
};

/**
* create Candidate table
* @async
* @function createCandidateTable
* @return {Promise<string>} candidates table deleted
*/
export const createCandidateTable = async function () {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS candidates(
        id serial Unique,
        office integer references offices(id) ON DELETE CASCADE not null,
        party integer references parties(id) ON DELETE CASCADE not null,
        candidate integer references users(id) ON DELETE CASCADE not null,
        Constraint candidate_id_pkey PRIMARY KEY (office ,candidate)
      )`);
    console.log('candidates table created');
   
  } catch (err) {
    console.log(err);
  }
};

/**
* Delete petition table
* @async
* @function dropPetitionTable
* @return {Promise<string>} petition table deleted
*/

export const dropPetitionTable = async function () {
  try {
    await pool.query('DROP TABLE IF EXISTS petitions');
    console.log('petitions table deleted');
  } catch (err) {
    console.log(err);
  }
};

/**
* Create petition table
* @async
* @function createPetitionTable
* @return {Promise<string>} petition table created
*/
export const createPetitionTable = async function () {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS petitions(
        id serial PRIMARY KEY,
        createdOn timestamp Default Current_timeStamp,
        createdBy Integer references users(id) ON DELETE CASCADE not null,
        office Integer references offices(id) On DELETE CASCADE not null,
        subject text not null,
        body text not null,
        evidence text []
      )`);
    console.log('petitions table created');
    
  } catch (err) {
    console.log(err);
  }
};

/**
* Delete all tables
* @async
* @function dropAllTables
* @return {Promise<string>} All table deleted
*/

export const dropAllTables = async function () {
  try {
    await dropPetitionTable();
    await dropVoteTable();
    await dropInterestTable();
    await dropCandidateTable();
    await dropPartyTable();
    await dropOfficeTable();
    await dropUserTable();
    console.log('All Tables deleted');
  } catch (err) {
    console.log(err);
  }
};
/**
* Create all tables
* @async
* @function createAllTables
* @return {Promise<string>} All table created
*/

export const createAllTables = async function () {
  try {
    await dropAllTables();
    await createUserTable();
    await createOfficeTable();
    await createPartyTable();
    await createInterestTable();
    await createCandidateTable();
    await createVoteTable();
    await createPetitionTable();
    console.log('All Tables created');
  } catch (err) {
    console.log(err);
  }
};
export const seedAllTables = async function(){
  await seed('users', users);
  await seed('offices', offices);
  await seed('parties', parties);
  await seed('interests', interests);
  await seed('candidates', candidates);
  await seed('votes', votes);
  await seed('petitions', petitions);
}
// run each function seperately.
require('make-runnable');
