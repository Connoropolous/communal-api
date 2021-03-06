var relationsForSelf = [
  'memberships',
  {'memberships.community': qb => qb.column('id', 'name', 'slug', 'avatar_url')},
  'skills',
  'organizations',
  'phones',
  'emails',
  'websites',
  'linkedAccounts',
  'onboarding'
];

var extraAttributes = function(user) {
  return Promise.props({
    public_email: user.encryptedEmail(),
    skills: Skill.simpleList(user.relations.skills),
    organizations: Organization.simpleList(user.relations.organizations),
    phones: UserPhone.simpleList(user.relations.phones),
    emails: UserEmail.simpleList(user.relations.emails),
    websites: UserWebsite.simpleList(user.relations.websites),
    extra_info: user.get('extra_info')
  });
};

var selfOnlyAttributes = function(user, isAdmin) {
  return Promise.props({
    notification_count: Activity.unreadCountForUser(user),
    is_admin: isAdmin
  });
};

var shortAttributes = [
  'id', 'name', 'avatar_url',
  'bio', 'intention', 'work',
  'facebook_url', 'linkedin_url', 'twitter_name'
];

var UserPresenter = module.exports = {

  shortAttributes: shortAttributes,

  fetchForSelf: function(userId, isAdmin) {
    return User.find(userId, {withRelated: relationsForSelf})
    .tap(user => { if (!user || !user.get('active')) throw "User not found"; })
    .then(user => Promise.join(user.toJSON(), extraAttributes(user), selfOnlyAttributes(user, isAdmin)))
    .then(attributes => _.extend.apply(_, attributes));
  },

  presentForSelf: function(attributes, session) {
    return _.extend(attributes, {provider_key: session.userProvider});
  },

  fetchForOther: function(id) {
    return User.find(id, {withRelated: ['skills', 'organizations', 'phones', 'emails', 'websites']})
    .tap(user => { if (!user || !user.get('active')) throw "User not found"; })
    .then(user => Promise.join(user, extraAttributes(user)))
    .spread((user, extra) => _.extend(user.attributes, extra));
  },

  presentForList: function(user) {
    return _.merge(
      _.pick(user.attributes, UserPresenter.shortAttributes),
      {
        skills: Skill.simpleList(user.relations.skills),
        organizations: Organization.simpleList(user.relations.organizations),
        public_email: user.encryptedEmail()
      }
    );
  }

};
