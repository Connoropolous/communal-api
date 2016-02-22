'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('tools', table => table.text('description'));
};

exports.down = function(knex, Promise) {

};
