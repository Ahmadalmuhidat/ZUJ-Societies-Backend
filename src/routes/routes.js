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
router.get('/login', auth_mdiddleware, auth_controller.register);

router.post('/register', auth_mdiddleware, auth_controller.register);

// comment routes
router.get('/get_comments', auth_mdiddleware, comments_controller.get_comments);

router.post('/create_comment', auth_mdiddleware, comments_controller.create_comment);

router.post('/delete_comment', auth_mdiddleware, comments_controller.delete_comment);

router.get('/get_comments_by_post', auth_mdiddleware, comments_controller.get_comments_by_post);

// events routes
router.get('/get_events', auth_mdiddleware, events_controller.get_events);

router.post('/create_event', auth_mdiddleware, events_controller.create_event);

router.post('/delete_event', auth_mdiddleware, events_controller.delete_event);

router.get('/get_events_by_society', auth_mdiddleware, events_controller.get_events_by_society);

// events routes
router.get('/get_posts', auth_mdiddleware, posts_controller.get_posts);

router.post('/create_post', auth_mdiddleware, posts_controller.create_post);

router.post('/delete_post', auth_mdiddleware, posts_controller.delete_post);

router.get('/get_posts_by_society', auth_mdiddleware, posts_controller.get_posts_by_society);

// societies routes
router.get('/get_societies', auth_mdiddleware, societies_controller.get_societies);

router.get('/search_society', auth_mdiddleware, societies_controller.search_society);

router.post('/join_society', auth_mdiddleware, societies_controller.join_society);

router.post('/create_society', auth_mdiddleware, societies_controller.create_society);

router.post('/delete_society', auth_mdiddleware, societies_controller.delete_society);

router.get('/get_societies_by_user', auth_mdiddleware, societies_controller.get_societies_by_user);

router.get('/get_members', auth_mdiddleware, societies_controller.get_members);

router.post('/invite_member', auth_mdiddleware, societies_controller.invite_member);

router.post('/remove_member', auth_mdiddleware, societies_controller.remove_member);

// users routes
router.get('/get_users', auth_mdiddleware, user_controller.get_users);

module.exports = router;
