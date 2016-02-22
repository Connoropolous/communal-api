var url = require('url')

module.exports = bookshelf.Model.extend({
  tableName: 'community',

  creator: function () {
    return this.belongsTo(User, 'created_by_id')
  },

  inactiveUsers: function () {
    return this.belongsToMany(User, 'users_community', 'community_id', 'user_id')
      .query({where: {'users_community.active': false}})
  },

  invitations: function () {
    return this.hasMany(Invitation)
  },

  leader: function () {
    return this.belongsTo(User, 'leader_id')
  },

  memberships: function () {
    return this.hasMany(Membership).query({where: {'users_community.active': true}})
  },

  tools: function () {
    return this.hasMany(UseOfTool)
  },

  moderators: function () {
    return this.belongsToMany(User, 'users_community', 'community_id', 'user_id')
      .query({where: {role: Membership.MODERATOR_ROLE}})
  },

  network: function () {
    return this.belongsTo(Network)
  },

  users: function () {
    return this.belongsToMany(User).through(Membership)
      .query({where: {'users_community.active': true, 'users.active': true}}).withPivot('role')
  }
}, {
  find: function (id_or_slug, options) {
    if (isNaN(Number(id_or_slug))) {
      return Community.where({slug: id_or_slug}).fetch(options)
    }
    return Community.where({id: id_or_slug}).fetch(options)
  },

  canInvite: function (userId, communityId) {
    return Community.find(communityId).then(function (community) {
      if (community.get('settings').all_can_invite) return true
      return Membership.hasModeratorRole(userId, communityId)
    })
  },

  copyAssets: function (opts) {
    return Community.find(opts.communityId).then(c => Promise.join(
        AssetManagement.copyAsset(c, 'community', 'avatar_url'),
        AssetManagement.copyAsset(c, 'community', 'banner_url')
    ))
  },

  notifyAboutCreate: function (opts) {
    return Community.find(opts.communityId, {withRelated: ['creator']}).then(c => {
      var creator = c.relations.creator
      var recipient = process.env.ASANA_NEW_COMMUNITIES_EMAIL
      Email.sendRawEmail(recipient, {
        subject: c.get('name'),
        body: format(
          '%s<br/>created by %s<br/>%s<br/>%s',
          Frontend.Route.community(c),
          creator.get('name'),
          creator.get('email'),
          Frontend.Route.profile(creator))
      }, {
        sender: {
          name: 'Hylobot',
          address: 'dev+bot@hylo.com'
        }
      })
    })
  },

  inNetworkWithUser: function (communityId, userId) {
    return Community.find(communityId)
    .then(community => community && community.get('network_id'))
    .then(networkId => networkId && Network.containsUser(networkId, userId))
  }

})
