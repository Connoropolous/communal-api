var passport = require('passport')

var findUser = function (service, email, id) {
  return User.query(function (qb) {
    qb.where('users.active', true)

    qb.leftJoin('linked_account', function () {
      this.on('linked_account.user_id', '=', 'users.id')
    })

    qb.where('email', email).orWhere(function () {
      this.where({provider_user_id: id, 'linked_account.provider_key': service})
    })
  }).fetch({withRelated: ['linkedAccounts']})
}

var hasLinkedAccount = function (user, service) {
  return !!user.relations.linkedAccounts.where({provider_key: service})[0]
}

var findCommunity = function (req) {
  if (!req.session.invitationId) return Promise.resolve([null, null])

  return Invitation.find(req.session.invitationId, {withRelated: ['community']})
  .then(function (invitation) {
    return [invitation.relations.community, invitation]
  })
}

var upsertUser = (req, service, profile) => {
  return findUser(service, profile.email, profile.id)
  .then(user => {
    if (user) {
      return UserSession.login(req, user, service)
      // if this is a new account, link it to the user
      .tap(() => hasLinkedAccount(user, service) ||
        LinkedAccount.create(user.id, {type: service, profile}, {updateUser: true}))
    }

    return findCommunity(req)
    .spread((community, invitation) => {
      var attrs = _.merge(_.pick(profile, 'email', 'name'), {
        community: (invitation ? null : community),
        account: {type: service, profile}
      })

      return User.createFully(attrs, invitation)
    })
    .tap(user => UserSession.login(req, user, service))
  })
}

var finishOAuth = function (strategy, req, res, next) {
  var service = strategy

  var respond = error => {
    if (error && error.stack) console.error(error.stack)
    return res.view('popupDone', {
      error,
      context: req.session.authContext || 'oauth',
      layout: null,
      returnDomain: req.session.returnDomain
    })
  }

  var authCallback = function (err, profile, info) {
    if (err || !profile) return respond(err || 'no user')

    upsertUser(req, service, profile)
    .then(user => UserExternalData.store(user.id, service, profile._json))
    .then(() => respond())
    .catch(respond)
  }

  passport.authenticate(strategy, authCallback)(req, res, next)
}

// save params into session variables so that they can be used to return to the
// right control flow
const setSessionFromParams = fn => (req, res) => {
  req.session.returnDomain = req.param('returnDomain')
  req.session.authContext = req.param('authContext')
  return fn(req, res)
}

module.exports = {
  create: function (req, res) {
    var email = req.param('email')
    var password = req.param('password')

    return User.authenticate(email, password)
    .tap(user => UserSession.login(req, user, 'password'))
    .tap(user => user.save({last_login: new Date()}, {patch: true}))
    .tap(user => {
      if (req.param('resp') === 'user') {
        return UserPresenter.fetchForSelf(user.id, Admin.isSignedIn(req))
        .then(attributes => UserPresenter.presentForSelf(attributes, req.session))
        .then(res.ok)
      } else {
        return res.ok({})
      }
    }).catch(function (err) {
      // 422 means 'well-formed but semantically invalid'
      res.status(422).send(err.message)
    })
  },

  startCTAuthOAuth: setSessionFromParams(function (req, res) {
    passport.authenticate('ctauth')(req, res)
  }),

  finishCTAuthOAuth: function (req, res, next) {
    finishOAuth('ctauth', req, res, next)
  },

  finishCTAuthTokenOAuth: function (req, res, next) {
    finishOAuth('ctauth-token', req, res, next)
  },

  destroy: function (req, res) {
    req.session.destroy()
    res.redirect('/')
  },

  // a 'pure' version of the above for API-only use
  destroySession: function (req, res) {
    req.session.destroy()
    res.ok({})
  },

  createWithToken: function (req, res) {
    var nextUrl = req.param('n') || Frontend.Route.userSettings() + '?expand=password'

    return User.find(req.param('u')).then(function (user) {
      if (!user) {
        res.status(422).send('No user id')
        return
      }

      return Promise.join(user, user.checkToken(req.param('t')))
    })
    .spread(function (user, match) {
      if (match) {
        UserSession.login(req, user, 'password')
        res.redirect(nextUrl)
        return
      }

      if (req.param('n')) {
        // still redirect, to give the user a chance to log in manually
        res.redirect(nextUrl)
      } else {
        res.status(422).send("Token doesn't match")
      }
    })
    .catch(res.serverError)
  }

}
