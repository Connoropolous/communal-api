var api = require('sendwithus')(process.env.SENDWITHUS_KEY)
var Promise = require('bluebird')
var sendEmail = Promise.promisify(api.send, api)

var defaultOptions = {
  sender: {
    address: process.env.EMAIL_SENDER,
    name: 'Groupa'
  }
}

var sendSimpleEmail = function (email, templateId, data, extraOptions) {
  return sendEmail(_.merge({}, defaultOptions, {
    email_id: templateId,
    recipient: {address: email},
    email_data: data
  }, extraOptions))
}

module.exports = {
  sendSimpleEmail: sendSimpleEmail,

  sendRawEmail: function (email, data, extraOptions) {
    return sendSimpleEmail(email, 'tem_nt4RmzAfN4KyPZYxFJWpFE', data, extraOptions)
  },

  sendPasswordReset: function (opts) {
    return sendSimpleEmail(opts.email, 'tem_mccpcJNEzS4822mAnDNmGT', opts.templateData)
  },

  sendInvitation: function (email, data) {
    return sendEmail(_.merge({}, defaultOptions, {
      email_id: 'tem_ZXZuvouDYKKhCrdEWYbEp9',
      recipient: {address: email},
      email_data: data,
      version_name: 'user-edited text',
      sender: {
        name: format('%s (via Hylo)', data.inviter_name),
        reply_to: data.inviter_email
      }
    }))
  }

}
