'use strict';

exports.up = function(knex, Promise) {
  return Promise.join(
    knex.schema.createTable('tools', function(table) {
      table.increments().primary();
      table.string('name').notNullable();
      table.string('url');
      table.string('avatar_url');
    }),
    knex.schema.createTable('tool_community', function(table) {
      table.increments();
      table.bigInteger('community_id').references('id').inTable('community');
      table.bigInteger('tool_id').references('id').inTable('tools');
      table.string('slug');
      table.timestamps();
    })
  );
};

exports.down = function(knex, Promise) {

};
