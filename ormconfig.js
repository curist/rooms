const database = process.env.NODE_ENV == 'production' ? ':memory:' : 'database.sqlite';

module.exports = {
   type: 'sqlite',
   database,
   synchronize: true,
   logging: false,
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
