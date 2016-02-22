var validator = require('validator')

var findContext = function (req) {

  if (req.session.invitationId) {
    return Invitation.find(req.session.invitationId, {withRelated: ['community']})
      .then(function (invitation) {
        return {community: invitation.relations.community, invitation: invitation}
      })
  }

  return Promise.props({community: Community.where({beta_access_code: req.param('code')}).fetch()})
}

var setupReputationQuery = function (req, model) {
  var params = _.pick(req.allParams(), 'userId', 'limit', 'start')
  var isSelf = req.session.userId === params.userId

  return Promise.method(function () {
    if (!isSelf) return Membership.activeCommunityIds(req.session.userId)
  })()
  .then(communityIds =>
    model.queryForUser(params.userId, communityIds).query(q => {
      q.limit(params.limit || 15)
      q.offset(params.start || 0)
    }))
}

module.exports = {
  create: function (req, res) {
    var params = _.pick(req.allParams(), 'name', 'email', 'password')

    return findContext(req)
    .then(ctx => {
      var attrs = _.merge(_.pick(params, 'name', 'email'), {
        community: (ctx.invitation ? null : ctx.community),
        account: {type: 'password', password: params.password}
      })

      return User.createFully(attrs, ctx.invitation)
    })
    .tap(user => req.param('login') && UserSession.login(req, user, 'password'))
    .then(user => {
      if (req.param('resp') === 'user') {
        return UserPresenter.fetchForSelf(user.id, Admin.isSignedIn(req))
        .then(attributes => UserPresenter.presentForSelf(attributes, req.session))
        .then(res.ok)
      } else {
        return res.ok({})
      }
    })
    .catch(function (err) {
      res.status(422).send(err.detail ? err.detail : err)
    })
  },

  status: function (req, res) {
    res.ok({signedIn: UserSession.isLoggedIn(req)})
  },

  findSelf: function (req, res) {
    return UserPresenter.fetchForSelf(req.session.userId, Admin.isSignedIn(req))
    .then(attributes => UserPresenter.presentForSelf(attributes, req.session))
    .then(res.ok)
    .catch(err => {
      if (err === 'User not found') return res.ok({})
      throw err
    })
    .catch(res.serverError)
  },

  findOne: function (req, res) {
    UserPresenter.fetchForOther(req.param('userId'))
    .then(res.ok)
    .catch(res.serverError)
  },

  update: function (req, res) {
    var attrs = _.pick(req.allParams(), [
      'name', 'bio', 'avatar_url', 'banner_url', 'twitter_name', 'linkedin_url', 'facebook_url',
      'email', 'work', 'intention', 'extra_info',
      'new_notification_count', 'settings'
    ])

    return User.find(req.param('userId'))
    .tap(function (user) {
      var newEmail = attrs.email
      var oldEmail = user.get('email')
      if (newEmail && newEmail !== oldEmail) {
        if (!validator.isEmail(newEmail)) {
          throw new Error('invalid-email')
        }
        return User.isEmailUnique(newEmail, oldEmail).then(function (isUnique) {
          if (!isUnique) throw new Error('duplicate-email')
        })
      }
    })
    .then(function (user) {
      // FIXME this should be in a transaction

      user.setSanely(attrs)

      var promises = []
      var changed = false

      _.each([
        ['skills', Skill],
        ['organizations', Organization],
        ['phones', UserPhone],
        ['emails', UserEmail],
        ['websites', UserWebsite]
      ], function (model) {
        var param = req.param(model[0])
        if (param) {
          promises.push(model[1].update(_.flatten([param]), user.id))
          changed = true
        }
      })

      if (!_.isEmpty(user.changed) || changed) {
        promises.push(user.save(
          _.extend({updated_at: new Date()}, user.changed),
          {patch: true}
        ))
      }

      var newPassword = req.param('password')
      if (newPassword) {
        promises.push(
          LinkedAccount.where({user_id: user.id, provider_key: 'password'}).fetch()
            .then(function (account) {
              if (account) return account.updatePassword(newPassword)
              return LinkedAccount.create(user.id, {type: 'password', password: newPassword})
            })
        )
      }

      return Promise.all(promises)
    })
    .then(() => res.ok({}))
    .catch(function (err) {
      if (_.contains(['invalid-email', 'duplicate-email'], err.message)) {
        res.statusCode = 422
        res.send(req.__(err.message))
      } else {
        res.serverError(err)
      }
    })
  },

  sendPasswordReset: function (req, res) {
    var email = req.param('email')
    User.where('email', email).fetch().then(function (user) {
      if (!user) {
        res.ok({error: 'no user'})
      } else {
        user.generateToken().then(function (token) {
          Queue.classMethod('Email', 'sendPasswordReset', {
            email: user.get('email'),
            templateData: {
              login_url: Frontend.Route.tokenLogin(user, token)
            }
          })
          res.ok({})
        })
      }
    })
    .catch(res.serverError.bind(res))
  },

  findForCommunity: function (req, res) {
    if (TokenAuth.isAuthenticated(res) &&
      !RequestValidation.requireTimeRange(req, res)) return

    var options = _.defaults(
      _.pick(req.allParams(), 'limit', 'offset', 'start_time', 'end_time'),
      {
        limit: 20,
        communities: [res.locals.community.id],
        term: req.param('search')
      }
    )
    var total

    Search.forUsers(options).fetchAll({withRelated: ['skills', 'organizations']})
    .tap(users => total = (users.length > 0 ? users.first().get('total') : 0))
    .then(users => users.map(UserPresenter.presentForList))
    .then(list => ({people_total: total, people: list}))
    .then(res.ok, res.serverError)
  },

  findForNetwork: function (req, res) {
    var total

    Community.query().where('network_id', req.param('networkId')).select('id')
    .then(rows => _.pluck(rows, 'id'))
    .then(ids => Search.forUsers({
      communities: ids,
      limit: req.param('limit') || 20,
      offset: req.param('offset') || 0
    }).fetchAll({withRelated: ['skills', 'organizations']}))
    .tap(users => total = (users.length > 0 ? users.first().get('total') : 0))
    .then(users => users.map(UserPresenter.presentForList))
    .then(list => ({people_total: total, people: list}))
    .then(res.ok, res.serverError)
  }

}
