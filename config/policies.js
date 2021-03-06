/* eslint key-spacing:0 */

/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */

module.exports.policies = {

  '*': false,

  SessionController: true,

  InvitationController: {
    use: true,
    findOne: true,
    find: ['sessionAuth', 'canInvite'],
    create: ['sessionAuth', 'canInvite']
  },

  AdminSessionController: {
    create:  true,
    oauth:   true,
    destroy: true
  },

  AdminController: {
    '*': ['isAdmin']
  },

  SearchController: {
    show: ['allowPublicAccess', 'sessionAuth', 'checkAndSetMembership'],
    autocomplete: ['sessionAuth', 'checkAndSetMembership']
  },

  UserController: {
    status:              true,
    create:              true,
    findSelf:            ['allowPublicAccess', 'sessionAuth'],
    findOne:             ['sessionAuth', 'inSameCommunityOrNetwork'],
    update:              ['sessionAuth', 'isSelf'],
    sendPasswordReset:   true,
    findForCommunity:    ['allowTokenAuth', 'sessionAuth', 'checkAndSetMembership'],
    findForNetwork:      ['sessionAuth', 'inNetwork']
  },

  ActivityController: {
    find:        ['sessionAuth'],
    update:      ['sessionAuth', 'isActivityOwner'],
    markAllRead: ['sessionAuth']
  },

  OnboardingController: {
    find:   ['sessionAuth'],
    update: ['sessionAuth', 'isSelf']
  },

  CommunityController: {
    find:            ['sessionAuth', 'isAdmin'],
    findOne:         ['allowPublicAccess', 'allowTokenAuth', 'sessionAuth', 'checkAndSetMembership'],
    findSettings:    ['sessionAuth', 'canInvite'],
    update:          ['sessionAuth', 'isModerator'],
    findModerators:  ['sessionAuth', 'isModerator'], // FIXME move to UserController
    findTools:       ['sessionAuth', 'checkAndSetMembership'],
    addModerator:    ['sessionAuth', 'isModerator'],
    removeModerator: ['sessionAuth', 'isModerator'],
    removeMember:    ['sessionAuth', 'isModerator'],
    leave:           ['sessionAuth', 'checkAndSetMembership'],
    validate:        true,
    create:          ['sessionAuth'],
    findForNetwork:  ['sessionAuth', 'inNetwork'],
    joinWithCode:    ['sessionAuth']
  },

  ToolController: {
    create:          ['sessionAuth'], //, 'isAdmin'],
    show:            ['sessionAuth'], //, 'isAdmin'],
    update:          ['sessionAuth'], //, 'isAdmin'],
    destroy:         ['sessionAuth'] //, 'isAdmin']
  },

  UseOfToolController: {
    create:          ['sessionAuth', 'isModerator'],
    show:            ['sessionAuth', 'isModerator'],
    update:          ['sessionAuth', 'isModerator'],
    destroy:         ['sessionAuth', 'isModerator']
  },

  MessageController: {
    relayFromEmail: true,
    createWaitlistRequest: true
  },

  NetworkController: {
    findOne: ['sessionAuth', 'inNetwork']
  },

  StaticPageController: {
    proxy: ['renderOpenGraphTags']
  },

}
