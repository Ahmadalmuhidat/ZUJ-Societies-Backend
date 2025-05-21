const express = require('express');
const router = express.Router();
const auth_controller = require('../controllers/auth');
const comments_controller = require('../controllers/comments');
const events_controller = require('../controllers/events');
const posts_controller = require('../controllers/posts');
const societies_controller = require('../controllers/societies');

const user_controller = require('../controllers/user');
const auth_mdiddleware = require('../middlewares/auth');

// auth routes
router.get('/auth/login', auth_mdiddleware, auth_controller.login);

router.post('/auth/register', auth_mdiddleware, auth_controller.register);


// users routes
router.get('/users/get_all_users', auth_mdiddleware, user_controller.get_users);

// router.delete('/users/delete_user', auth_mdiddleware, user_controller.delete_user);


// societies routes
router.get('/societies/get_all_societies', auth_mdiddleware, societies_controller.get_all_societies);

router.get('/societies/search_society', auth_mdiddleware, societies_controller.search_society);

router.post('/societies/create_society', auth_mdiddleware, societies_controller.create_society);

router.delete('/societies/delete_society', auth_mdiddleware, societies_controller.delete_society);

router.get('/societies/get_societies_by_user', auth_mdiddleware, societies_controller.get_societies_by_user);

router.post('/societies/join_society_request', auth_mdiddleware, societies_controller.join_society_request);

router.put('/societies/accept_request', auth_mdiddleware, societies_controller.accept_request);

router.put('/societies/reject_request', auth_mdiddleware, societies_controller.reject_request);

router.get('/societies/get_all_requests', auth_mdiddleware, societies_controller.get_all_requests);

router.get('/societies/get_all_members', auth_mdiddleware, societies_controller.get_all_members);

router.delete('/societies/remove_member', auth_mdiddleware, societies_controller.remove_member);


// comment routes
router.get('/comment/get_comments_by_post', auth_mdiddleware, comments_controller.get_comments_by_post);

router.post('/comment/create_comment', auth_mdiddleware, comments_controller.create_comment);

router.delete('/comment/delete_comment', auth_mdiddleware, comments_controller.delete_comment);


// events routes
router.get('/events/get_all_events', auth_mdiddleware, events_controller.get_all_events);

router.post('/events/create_event', auth_mdiddleware, events_controller.create_event);

router.delete('/events/delete_event', auth_mdiddleware, events_controller.delete_event);

router.get('/events/get_events_by_society', auth_mdiddleware, events_controller.get_events_by_society);


// posts routes
router.get('/posts/get_all_posts', auth_mdiddleware, posts_controller.get_all_posts);

router.post('/posts/create_post', auth_mdiddleware, posts_controller.create_post);

router.delete('/posts/delete_post', auth_mdiddleware, posts_controller.delete_post);

router.get('/posts/get_posts_by_society', auth_mdiddleware, posts_controller.get_posts_by_society);

module.exports = router;
