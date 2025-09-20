const User = require('../models/users');
const Society = require('../models/societies');
const Post = require('../models/posts');
const Event = require('../models/events');
const Comment = require('../models/comments');
const Like = require('../models/likes');
const Notification = require('../models/notifications');
const jsonWebToken = require("../helper/json_web_token");
const { v4: uuidv4 } = require("uuid");

// Store active SSE connections
const activeConnections = new Map();

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error_message: "Token required" });
    }

    let userId;
    try {
      userId = jsonWebToken.verify_token(token)['id'];
    } catch {
      return res.status(401).json({ error_message: "Invalid token" });
    }

    // Get notifications from database
    const notifications = await Notification.find({ User: userId })
      .sort({ CreatedAt: -1 })
      .limit(50);

    res.status(200).json({ data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to fetch notifications" });
  }
};

// Server-Sent Events endpoint
exports.getNotificationsSSE = (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ error_message: "Token required" });
  }

  let userId;
  try {
    userId = jsonWebToken.verify_token(token)['id'];
  } catch {
    return res.status(401).json({ error_message: "Invalid token" });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notifications' })}\n\n`);

  // Store connection
  activeConnections.set(userId, res);

  // Handle client disconnect
  req.on('close', () => {
    activeConnections.delete(userId);
    clearInterval(heartbeat);
    console.log(`SSE connection closed for user ${userId}`);
  });

  // Handle client error
  req.on('error', (error) => {
    console.error(`SSE connection error for user ${userId}:`, error);
    activeConnections.delete(userId);
    clearInterval(heartbeat);
  });

  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    if (activeConnections.has(userId) && !res.destroyed) {
      try {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
      } catch (error) {
        console.error(`Failed to send heartbeat to user ${userId}:`, error);
        activeConnections.delete(userId);
        clearInterval(heartbeat);
      }
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);

  console.log(`SSE connection established for user ${userId}`);
};

// Function to send notification to specific user
const sendNotificationToUser = (userId, notification) => {
  const connection = activeConnections.get(userId);
  if (connection) {
    try {
      connection.write(`data: ${JSON.stringify(notification)}\n\n`);
      console.log(`Notification sent to user ${userId}:`, notification.title);
    } catch (error) {
      console.error(`Failed to send notification to user ${userId}:`, error);
      activeConnections.delete(userId);
    }
  }
};

// Function to send notification to multiple users
const sendNotificationToUsers = async (userIds, notification) => {
  // Save notifications to database
  const notificationsToSave = userIds.map(userId => ({
    ID: uuidv4(),
    User: userId,
    Type: notification.type,
    Title: notification.title,
    Message: notification.message,
    Data: notification.data || {},
    Read: false,
    CreatedAt: new Date(notification.time || Date.now())
  }));

  try {
    await Notification.insertMany(notificationsToSave);
    console.log(`Saved ${notificationsToSave.length} notifications to database`);
  } catch (error) {
    console.error('Failed to save notifications to database:', error);
  }

  // Send real-time notifications via SSE
  userIds.forEach(userId => {
    sendNotificationToUser(userId, notification);
  });
};

// Export notification sending functions
exports.sendNotificationToUser = sendNotificationToUser;
exports.sendNotificationToUsers = sendNotificationToUsers;

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(401).json({ error_message: "Token required" });
    }

    let userId;
    try {
      userId = jsonWebToken.verify_token(token)['id'];
    } catch {
      return res.status(401).json({ error_message: "Invalid token" });
    }

    const { notificationId } = req.body;
    
    console.log('Marking notification as read:', { notificationId, userId });
    
    const result = await Notification.updateOne(
      { ID: notificationId, User: userId },
      { Read: true }
    );
    
    console.log('Update result:', result);
    
    res.status(200).json({ data: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(401).json({ error_message: "Token required" });
    }

    let userId;
    try {
      userId = jsonWebToken.verify_token(token)['id'];
    } catch {
      return res.status(401).json({ error_message: "Invalid token" });
    }

    await Notification.updateMany(
      { User: userId, Read: false },
      { Read: true }
    );
    
    res.status(200).json({ data: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to mark all notifications as read" });
  }
};
