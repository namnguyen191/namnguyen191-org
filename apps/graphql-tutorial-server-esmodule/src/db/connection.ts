import knex from 'knex';

const config: knex.Knex.Config = {
  client: 'better-sqlite3',
  connection: {
    filename: 'apps/graphql-tutorial-server-esmodule/src/data/db.sqlite3',
  },
  useNullAsDefault: true,
};

export const connection = knex(config);

connection.on('query', ({ sql, bindings }) => {
  const query = connection.raw(sql, bindings).toQuery();
  console.log('[db]', query);
});
