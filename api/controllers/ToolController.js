var validator = require('validator')

module.exports = {

  create: function (req, res) {
    var params = _.pick(req.allParams(), 'name', 'url', 'avatar_url')

    return new Tool(params).save()
    .then(() => res.ok({}))
    .catch(res.serverError)
  },

  show: function (req, res) {
    //
  },

  update: function (req, res) {
    var whitelist = [
      'name', 'avatar_url', 'url', 'description'
    ]
    var attributes = _.pick(req.allParams(), whitelist)
    var tool = new Tool({id: req.param('toolId')})

    tool.save(attributes, {patch: true})
    .then(() => res.ok({}))
    .catch(res.serverError)
  },

  destroy: function (req, res) {
    //
  }

}
