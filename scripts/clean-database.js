/**
 * This script provides options to clean or reset the Backstage database.
 * Usage: node scripts/clean-database.js [--reset-all]
 * 
 * Options:
 *   --reset-all: Completely removes the database file and creates a new one
 *   --clean-entities: Removes all entities from the catalog
 */

const fs = require('fs');
const path = require('path');
const { Database } = require('better-sqlite3');
const readline = require('readline');

// Default SQLite database path
const DEFAULT_DB_PATH = path.resolve(__dirname, '../backstage.db');

// Find actual database location from config
function getDatabasePathFromConfig() {
  try {
    const yaml = require('js-yaml');
    const configPath = path.resolve(__dirname, '../app-config.local.yaml');
    
    if (fs.existsSync(configPath)) {
      const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
      if (config?.backend?.database?.connection) {
        const connection = config.backend.database.connection;
        if (typeof connection === 'string' && connection !== ':memory:') {
          return connection;
        } else if (connection.filename && connection.filename !== ':memory:') {
          return connection.filename;
        }
      }
    }
  } catch (e) {
    console.log('Could not parse config file, using default database path');
  }
  return DEFAULT_DB_PATH;
}

const dbPath = getDatabasePathFromConfig();
console.log(`Database path: ${dbPath}`);

function confirmAction(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${question} (y/N): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function resetDatabase() {
  if (dbPath === ':memory:') {
    console.log('Database is in-memory, nothing to reset');
    return;
  }

  const confirmed = await confirmAction(
    `WARNING: This will completely delete your database at ${dbPath}. All data will be lost. Continue?`
  );

  if (!confirmed) {
    console.log('Operation canceled');
    return;
  }

  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log(`Database file deleted: ${dbPath}`);
      console.log('A new database will be created when you restart Backstage.');
    } else {
      console.log(`No database file found at ${dbPath}`);
    }
  } catch (error) {
    console.error(`Failed to delete database: ${error.message}`);
    if (error.code === 'EBUSY') {
      console.log('The database file is currently in use. Please stop all Backstage processes first.');
    }
  }
}

async function cleanEntities() {
  if (dbPath === ':memory:') {
    console.log('Database is in-memory, restart Backstage to reset it');
    return;
  }

  if (!fs.existsSync(dbPath)) {
    console.log(`No database file found at ${dbPath}`);
    return;
  }

  const confirmed = await confirmAction(
    'This will remove all entities from the catalog. Continue?'
  );

  if (!confirmed) {
    console.log('Operation canceled');
    return;
  }

  try {
    const db = new Database(dbPath);
    
    // Get all tables related to catalog entities
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND 
      (name LIKE 'catalog_%' OR name LIKE 'entities%' OR name LIKE 'refresh_state%')
    `).all();

    if (tables.length === 0) {
      console.log('No catalog-related tables found');
      db.close();
      return;
    }

    // Begin a transaction
    const transaction = db.transaction(() => {
      for (const table of tables) {
        console.log(`Cleaning table: ${table.name}`);
        db.prepare(`DELETE FROM "${table.name}"`).run();
      }
    });

    transaction();
    console.log('Successfully cleaned all catalog entities');
    db.close();
  } catch (error) {
    console.error(`Failed to clean entities: ${error.message}`);
    if (error.code === 'SQLITE_BUSY') {
      console.log('The database is currently in use. Please stop all Backstage processes first.');
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--reset-all')) {
    await resetDatabase();
  } else if (args.includes('--clean-entities')) {
    await cleanEntities();
  } else {
    console.log('Choose an operation:');
    console.log('1. Reset entire database (remove database file)');
    console.log('2. Clean catalog entities only');
    console.log('3. Exit');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter your choice (1-3): ', async (choice) => {
      rl.close();
      
      switch (choice) {
        case '1':
          await resetDatabase();
          break;
        case '2':
          await cleanEntities();
          break;
        default:
          console.log('Exiting without changes');
      }
    });
  }
}

main();
