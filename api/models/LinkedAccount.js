var bcrypt = require('bcrypt')
var Promise = require('bluebird')
var hash = Promise.promisify(bcrypt.hash, bcrypt)

module.exports = bookshelf.Model.extend({
  tableName: 'linked_account',

  user: function () {
    return this.belongsTo(User)
  },

  activeUser: function () {
    return this.belongsTo(User).query({where: {active: true}})
  },

  updatePassword: function (password) {
    return hash(password, 10)
    .then(provider_user_id => this.save({provider_user_id}, {patch: true}))
  }

}, {
  create: function (userId, data, options) {
    if (!options) options = {}
    var type = data.type
    var profile = data.profile

    return (() =>
      type === 'password'
        ? hash(data.password, 10)
        : Promise.resolve(null))()
    .then(hashed => new LinkedAccount({
      provider_key: type,
      provider_user_id: hashed || profile.id,
      user_id: userId
    }).save({}, _.pick(options, 'transacting')))
    .tap(() => options.updateUser &&
      User.find(userId, _.pick(options, 'transacting'))
      .then(user => {
        var avatar_url = user.get('avatar_url')
        var attributes = this.socialMediaAttributes(type, profile)
        if (avatar_url && !avatar_url.match(/gravatar/)) {
          attributes.avatar_url = avatar_url
        }
        return User.query().where('id', userId)
        .update(attributes)
        .transacting(options.transacting)
      }))
  },

  socialMediaAttributes: function (type, profile) {
    switch (type) {
    }
  }
})
