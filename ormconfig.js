const IN_MEMORY = process.env.NODE_ENV == 'production'
const DB_CONFIG = IN_MEMORY ? {} : {
  autoSave: true,
  location: 'database.sqlite',
}
module.exports = {
  ...DB_CONFIG,
  type: 'sqljs',
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
