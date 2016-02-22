
module.exports = bookshelf.Model.extend({
  tableName: 'tools',

  communities: function () {
    return this.belongsToMany(Community, 'tool_community').through(UseOfTool)
  }

}, {

  create: function (attributes, options) {
    if (!options) options = {}
    var trx = options.transacting

    attributes = _.merge({
      avatar_url: 'http://cdn.hylo.com/misc/hylo-logo-white-on-teal-circle.png',
      created_at: new Date(),
      updated_at: new Date()
    }, attributes)

    return new Tool(attributes).save({}, {transacting: trx})
  },

  find: function (id, options) {
    if (!id) return Promise.resolve(null)
    return Tool.where({id: id}).fetch(options)
  }
})
