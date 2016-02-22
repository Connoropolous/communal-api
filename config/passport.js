var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var CTAuthStrategy = require('passport-ctauth')
// -----------
// admin login

var adminStrategy = new GoogleStrategy({
  clientID: process.env.ADMIN_GOOGLE_CLIENT_ID,
  clientSecret: process.env.ADMIN_GOOGLE_CLIENT_SECRET,
  callbackURL: format('%s://%s%s', process.env.PROTOCOL, process.env.DOMAIN, '/noo/admin/login/oauth')
}, function (accessToken, refreshToken, profile, done) {
  var email = profile.emails[0].value

  if (email.match(/hylo\.com$/)) {
    done(null, {email: email})
  } else {
    done(null, false, {message: 'Not a hylo.com address.'})
  }
})
adminStrategy.name = 'admin'
passport.use(adminStrategy)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

// -----------
// user login
//
// doesn't use the serialize and deserialize handlers above
// because we're using workarounds to play nice with Play
// (see UserSession)
//
// TODO at some point when Play is totally out of the picture, refactor all this
// so that the user logins are more in line with conventional usage of Passport, e.g.
// use req.login to set req.user, and only the admin login is unconventional
//

var url = function (path) {
  return format('%s://%s%s', process.env.PROTOCOL, process.env.DOMAIN, path)
}

var formatProfile = function (profile, accessToken, refreshToken) {

  return {
    id: profile.sub,
    name: 'Connor Turland', // todo
    email: profile.email,
    _json: {
      access_token: accessToken,
    }
  }
}

var ctauthStrategy = new CTAuthStrategy({
  clientID: process.env.CTAUTH_CLIENT_ID,
  clientSecret: process.env.CTAUTH_CLIENT_SECRET,
  callbackURL: url('/noo/login/ctauth/oauth')
}, function (accessToken, refreshToken, profile, done) {
  done(null, formatProfile(profile))
})
passport.use(ctauthStrategy)

