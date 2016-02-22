/* eslint key-spacing:0, spaced-comment:0 */

/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

  'GET    /noo/user/status':                              'UserController.status',
  'GET    /noo/user/me':                                  'UserController.findSelf',
  'POST   /noo/user/password':                            'UserController.sendPasswordReset',
  'GET    /noo/user/:userId':                             'UserController.findOne',
  'POST   /noo/user':                                     'UserController.create',
  'POST   /noo/user/:userId':                             'UserController.update',
  'GET    /noo/user/:userId/onboarding':                  'OnboardingController.find',
  'POST   /noo/user/:userId/onboarding':                  'OnboardingController.update',

  'GET    /noo/community':                                'CommunityController.find',
  'POST   /noo/community':                                'CommunityController.create',
  'POST   /noo/community/code':                           'CommunityController.joinWithCode',
  'POST   /noo/community/validate':                       'CommunityController.validate',
  'GET    /noo/community/:communityId':                   'CommunityController.findOne',
  'POST   /noo/community/:communityId':                   'CommunityController.update',
  'GET    /noo/community/:communityId/settings':          'CommunityController.findSettings',
  'GET    /noo/community/:communityId/moderators':        'CommunityController.findModerators',
  'POST   /noo/community/:communityId/moderators':        'CommunityController.addModerator',
  'DELETE /noo/community/:communityId/moderator/:userId': 'CommunityController.removeModerator',
  'GET    /noo/community/:communityId/members':           'UserController.findForCommunity',
  'DELETE /noo/community/:communityId/member/:userId':    'CommunityController.removeMember',
  'GET    /noo/community/:communityId/tools':             'CommunityController.findTools',
  'POST   /noo/community/:communityId/tools':             'UseOfToolController.create',
  'GET    /noo/community/:communityId/tools/:useId':      'UseOfToolController.show',
  'POST   /noo/community/:communityId/tools/:useId':      'UseOfToolController.update',
  'DELETE /noo/community/:communityId/tools/:useId':      'UseOfToolController.destroy',
  'GET    /noo/community/:communityId/invitations':       'InvitationController.find',
  'POST   /noo/community/:communityId/invite':            'InvitationController.create',

  'DELETE /noo/membership/:communityId':                  'CommunityController.leave',

  'GET    /noo/activity':                                 'ActivityController.find',
  'POST   /noo/activity':                                 'ActivityController.update',
  'POST   /noo/activity/mark-all-read':                   'ActivityController.markAllRead',
  'POST   /noo/activity/:activityId':                     'ActivityController.update',

  'POST   /noo/tools':                                    'ToolController.create',
  'GET    /noo/tools/:toolId':                            'ToolController.show',
  'POST   /noo/tools/:toolId':                            'ToolController.update',
  'POST   /noo/tools/:toolId':                            'ToolController.destroy',

  'GET    /noo/network/:networkId':                       'NetworkController.findOne',
  'GET    /noo/network/:networkId/posts':                 'PostController.findForNetwork',
  'GET    /noo/network/:networkId/communities':           'CommunityController.findForNetwork',
  'GET    /noo/network/:networkId/members':               'UserController.findForNetwork',

  'GET    /noo/search':                                   'SearchController.show',
  'GET    /noo/autocomplete':                             'SearchController.autocomplete',

  'GET    /noo/invitation/:token':                        'InvitationController.findOne',
  'POST   /noo/invitation/:token':                        'InvitationController.use',

  'POST   /noo/waitlist':                                 'MessageController.createWaitlistRequest',

  'GET    /noo/admin/login':                              'AdminSessionController.create',
  'GET    /noo/admin/login/oauth':                        'AdminSessionController.oauth',
  'GET    /noo/admin/logout':                             'AdminSessionController.destroy',
  'GET    /noo/admin':                                    'AdminController.index',
  'GET    /noo/admin/metrics':                            'AdminController.metrics',
  'GET    /noo/admin/login-as/:userId':                   'AdminController.loginAsUser',

  'POST   /noo/login':                                    'SessionController.create',
  'GET    /noo/login/token':                              'SessionController.createWithToken',
  'GET    /noo/login/ctauth':                             'SessionController.startCTAuthOAuth',
  'GET    /noo/login/ctauth/oauth':                       'SessionController.finishCTAuthOAuth',
  'GET    /noo/logout':                                   'SessionController.destroy',
  'DELETE /noo/session':                                  'SessionController.destroySession',

  '/*':                                                   'StaticPageController.proxy'
}
