var validator = require('validator')

module.exports = {
  create: function (req, res) {
    var params = _.pick(req.allParams(), 'slug', 'tool_id')

    return new UseOfTool(_.merge({
      community_id: req.param('communityId'),
      created_at: new Date(),
      updated_at: new Date()
    }, params)).save()
    .then(() => res.ok({}))
    .catch(res.serverError)
  },

  show: function (req, res) {
    //
  },

  update: function (req, res) {
    var whitelist = [
      'slug'
    ]
    var attributes = _.pick(req.allParams(), whitelist)
    var useOfTool = new UseOfTool({id: req.param('useId')})

    useOfTool.save(attributes, {patch: true})
    .then(() => res.ok({}))
    .catch(res.serverError)
  },

  destroy: function (req, res) {
    //FIXME validate that the user has the rights to remove this tool a.k.a. is moderator of that community
    new UseOfTool({id: req.param('useId')})
    .destroy()
    .then(() => res.ok({}))
    .catch(res.serverError)
  }

}
