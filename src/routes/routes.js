const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const commentsController = require('../controllers/comments');
const eventsController = require('../controllers/events');
const postsController = require('../controllers/posts');
const societiesController = require('../controllers/societies');
const userController = require('../controllers/user');
const authMiddleware = require('../middlewares/auth');
const supportController = require('../controllers/support');

// auth routes
router.get('/auth/login', authController.login);

router.post('/auth/register', authController.register);

// users routes
router.get('/users/get_user_info', authMiddleware.checkUserLoggedIn, userController.getUserInformation);

router.get('/users/get_user_profile_info', authMiddleware.checkUserLoggedIn, userController.getUserProfileInformation);

router.put('/users/update_profile', authMiddleware.checkUserLoggedIn, userController.updateProfile);

// router.delete('/users/delete_user', auth_mdiddleware.checkUserLoggedIn, userController.deleteUser);

// societies routes
router.get('/societies/get_society_info', authMiddleware.checkUserLoggedIn, societiesController.getSocietyInformation);

router.get('/societies/get_all_societies', authMiddleware.checkUserLoggedIn, societiesController.getAllSocieties);

// router.get('/societies/search_society', authMiddleware.checkUserLoggedIn, societiesController.searchSociety);

router.post('/societies/create_society', authMiddleware.checkUserLoggedIn, societiesController.createSociety);

router.delete('/societies/delete_society', authMiddleware.checkUserLoggedIn, societiesController.deleteSociety);

router.get('/societies/get_societies_by_User', authMiddleware.checkUserLoggedIn, societiesController.getSocietiesByUser);

router.post('/societies/join_society_request', authMiddleware.checkUserLoggedIn, societiesController.joinSocietyRequest);

router.post('/societies/approve_request', authMiddleware.checkUserLoggedIn, societiesController.approveRequest);

router.post('/societies/reject_request', authMiddleware.checkUserLoggedIn, societiesController.rejectRequest);

router.get('/societies/get_all_join_requests', authMiddleware.checkUserLoggedIn, societiesController.getAllJoinRequests);

router.get('/societies/get_all_members', authMiddleware.checkUserLoggedIn, societiesController.getAllMembers);

router.delete('/societies/remove_member', authMiddleware.checkUserLoggedIn, societiesController.removeMember);

router.get('/societies/check_membership', authMiddleware.checkUserLoggedIn, societiesController.checkMembership);

router.put('/societies/update_info', authMiddleware.checkUserLoggedIn, societiesController.updateInformation);

router.put('/societies/update_member_role', authMiddleware.checkUserLoggedIn, societiesController.updateMemberRole);

router.put('/societies/leave_society', authMiddleware.checkUserLoggedIn, societiesController.leaveSociety);

// comment routes
router.get('/comment/get_comments_by_post', authMiddleware.checkUserLoggedIn, commentsController.getCommentsByPost);

router.post('/comment/create_comment', authMiddleware.checkUserLoggedIn, commentsController.createComment);

router.delete('/comment/delete_comment', authMiddleware.checkUserLoggedIn, commentsController.deleteComment);

// events routes
router.get('/events/get_all_events', authMiddleware.checkUserLoggedIn, eventsController.getAllEvents);

router.get('/events/search_event', authMiddleware.checkUserLoggedIn, eventsController.searchEvent);

router.get('/events/get_event_info', authMiddleware.checkUserLoggedIn, eventsController.getEventInfo);

router.post('/events/create_event', authMiddleware.checkUserLoggedIn, eventsController.createEvent);

router.delete('/events/delete_event', authMiddleware.checkUserLoggedIn, eventsController.deleteEvent);

router.get('/events/get_events_by_society', authMiddleware.checkUserLoggedIn, eventsController.getEventsBySociety);

// posts routes
router.get('/posts/get_all_posts', authMiddleware.checkUserLoggedIn, postsController.getAllPosts);

router.post('/posts/create_post', authMiddleware.checkUserLoggedIn, postsController.createPost);

router.delete('/posts/delete_post', authMiddleware.checkUserLoggedIn, postsController.deletePost);

router.get('/posts/get_posts_by_society', authMiddleware.checkUserLoggedIn, postsController.getPostsBySociety);

router.post('/posts/like_post', authMiddleware.checkUserLoggedIn, postsController.likePost);

// Support routes
router.post('/support/create_ticket', authMiddleware.checkUserLoggedIn, supportController.CreateTicket);

module.exports = router;