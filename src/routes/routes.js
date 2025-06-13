const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const CommentsController = require('../controllers/Comments');
const EventsController = require('../controllers/Events');
const PostsController = require('../controllers/Posts');
const SocietiesController = require('../controllers/Societies');
const UserController = require('../controllers/User');
const authMiddleware = require('../middlewares/auth');
const SupportController = require('../controllers/Support');

// auth routes
router.get('/auth/login', authController.login);

router.post('/auth/register', authController.register);

// Users routes
router.get('/Users/get_User_info', authMiddleware.checkUserLoggedIn, UserController.getUserInformation);

router.get('/Users/get_User_profile_info', authMiddleware.checkUserLoggedIn, UserController.getUserProfileInformation);

router.put('/Users/update_profile', authMiddleware.checkUserLoggedIn, UserController.updateProfile);

// router.delete('/Users/delete_User', auth_mdiddleware.checkUserLoggedIn, User_controller.delete_User);

// Societies routes
router.get('/Societies/get_society_info', authMiddleware.checkUserLoggedIn, SocietiesController.getSocietyInformation);

router.get('/Societies/get_all_Societies', authMiddleware.checkUserLoggedIn, SocietiesController.getAllSocieties);

router.get('/Societies/search_society', authMiddleware.checkUserLoggedIn, SocietiesController.searchSociety);

router.post('/Societies/create_society', authMiddleware.checkUserLoggedIn, SocietiesController.createSociety);

router.delete('/Societies/delete_society', authMiddleware.checkUserLoggedIn, SocietiesController.deleteSociety);

router.get('/Societies/get_Societies_by_User', authMiddleware.checkUserLoggedIn, SocietiesController.getSocietiesByUser);

router.post('/Societies/join_society_request', authMiddleware.checkUserLoggedIn, SocietiesController.joinSocietyRequest);

router.post('/Societies/approve_request', authMiddleware.checkUserLoggedIn, SocietiesController.approveRequest);

router.post('/Societies/reject_request', authMiddleware.checkUserLoggedIn, SocietiesController.rejectRequest);

router.get('/Societies/get_all_join_requests', authMiddleware.checkUserLoggedIn, SocietiesController.getAllJoinRequests);

router.get('/Societies/get_all_members', authMiddleware.checkUserLoggedIn, SocietiesController.getAllMembers);

router.delete('/Societies/remove_member', authMiddleware.checkUserLoggedIn, SocietiesController.removeMember);

router.get('/Societies/check_membership', authMiddleware.checkUserLoggedIn, SocietiesController.checkMembership);

router.put('/Societies/update_info', authMiddleware.checkUserLoggedIn, SocietiesController.updateInformation);

router.put('/Societies/update_member_role', authMiddleware.checkUserLoggedIn, SocietiesController.updateMemberRole);

router.put('/Societies/leave_society', authMiddleware.checkUserLoggedIn, SocietiesController.leaveSociety);

// comment routes
router.get('/comment/get_Comments_by_post', authMiddleware.checkUserLoggedIn, CommentsController.getCommentsByPost);

router.post('/comment/create_comment', authMiddleware.checkUserLoggedIn, CommentsController.createComment);

router.delete('/comment/delete_comment', authMiddleware.checkUserLoggedIn, CommentsController.deleteComment);

// Events routes
router.get('/Events/get_all_Events', authMiddleware.checkUserLoggedIn, EventsController.getAllEvents);

router.get('/Events/search_event', authMiddleware.checkUserLoggedIn, EventsController.searchEvent);

router.get('/Events/get_event_info', authMiddleware.checkUserLoggedIn, EventsController.getEventInfo);

router.post('/Events/create_event', authMiddleware.checkUserLoggedIn, EventsController.createEvent);

router.delete('/Events/delete_event', authMiddleware.checkUserLoggedIn, EventsController.deleteEvent);

router.get('/Events/get_Events_by_society', authMiddleware.checkUserLoggedIn, EventsController.getEventsBySociety);

// Posts routes
router.get('/Posts/get_all_Posts', authMiddleware.checkUserLoggedIn, PostsController.getAllPosts);

router.post('/Posts/create_post', authMiddleware.checkUserLoggedIn, PostsController.createPost);

router.delete('/Posts/delete_post', authMiddleware.checkUserLoggedIn, PostsController.deletePost);

router.get('/Posts/get_Posts_by_society', authMiddleware.checkUserLoggedIn, PostsController.getPostsBySociety);

router.post('/Posts/like_post', authMiddleware.checkUserLoggedIn, PostsController.likePost);

// Support routes
router.post('/Support/create_ticket', authMiddleware.checkUserLoggedIn, SupportController.CreateTicket);

module.exports = router;