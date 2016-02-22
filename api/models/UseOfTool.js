module.exports = bookshelf.Model.extend({
  tableName: 'tool_community',

  tool: function () {
    return this.belongsTo(Tool)
  },

  community: function () {
    return this.belongsTo(Community)
  }

}, {

  find: function (tool_id, community_id_or_slug, options) {
    var fetch = function (community_id) {
      return UseOfTool.where({
        tool_id: tool_id,
        community_id: community_id
      }).fetch(options)
    }

    if (isNaN(Number(community_id_or_slug))) {
      return Community.find(community_id_or_slug)
      .then(function (community) {
        if (community) return fetch(community.id, options)
      })
    }

    return fetch(community_id_or_slug)
  },

  create: function (userId, communityId, opts) {
    if (!opts) opts = {}

    return new UseOfTool({
      tool_id: toolId,
      community_id: communityId,
      created_at: new Date(),
      updated_at: new Date(),
      slug: opts.slug
    })
    .save({}, {transacting: opts.transacting})
  }
})
