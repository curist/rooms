const database = process.env.NODE_ENV == 'production' ? ':memory:' : 'database.sqlite';

module.exports = {
  type: 'sqljs',
  database: 'foo.db',
  autoSave: true,
  location: 'database.sqlite',
  synchronize: true,
  logging: true,
  entities: [
    'src/entity/**/*.ts'
  ],
  migrations: [
    'src/migration/**/*.ts'
  ],
  subscribers: [
    'src/subscriber/**/*.ts'
  ],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber'
  }
}
