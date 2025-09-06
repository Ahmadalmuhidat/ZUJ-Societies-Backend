const Society = require("../models/societies");
const SocietyMember = require("../models/societyMembers");
const SocietyJoinRequest = require("../models/societyJoinRequests");
const SocietyInvite = require('../models/SocietyInvite');
const User = require("../models/users");
const { v4: uuidv4 } = require("uuid");
const jsonWebToken = require("../helper/json_web_token");

// Get Society info
exports.getSocietyInformation = async (req, res) => {
  try {
    const society = await Society.findOne({ ID: req.query.society_id }).select(
      "Name Description Image Category Privacy Permissions Notifications"
    );
    if (!society) {
      return res.status(404).json({ error_message: "Society not found" });
    }
    res.status(200).json({ data: society });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get society info" });
  }
};

// Invite user to society
exports.inviteMemberToSociety = async (req, res) => {
  try {
    const { SocietyID, InviteeID, token } = req.body;

    // Step 1: Authenticate inviter
    const decoded = jsonWebToken.verify_token(token);
    const inviterID = decoded.id;

    // Step 2: Get society
    const society = await Society.findOne({ ID: SocietyID });
    if (!society) {
      return res.status(404).json({ error_message: 'Society not found' });
    }

    // Step 3: Check inviter's role
    const inviterMember = await SocietyMember.findOne({ Society: SocietyID, User: inviterID });
    if (!inviterMember) {
      return res.status(403).json({ error_message: 'You are not a member of this society' });
    }

    const whoCanInvite = society.Permissions?.whoCanInvite || 'all-members';
    const inviterRole = inviterMember.Role;

    const canInvite =
      (whoCanInvite === 'all-members') ||
      (whoCanInvite === 'moderators' && ['moderator', 'admin'].includes(inviterRole)) ||
      (whoCanInvite === 'admins' && inviterRole === 'admin');

    if (!canInvite) {
      return res.status(403).json({ error_message: 'You do not have permission to invite members' });
    }

    // Step 4: Check if the user is already a member
    const isAlreadyMember = await SocietyMember.findOne({ Society: SocietyID, User: InviteeID });
    if (isAlreadyMember) {
      return res.status(400).json({ error_message: 'User is already a member of this society' });
    }

    // Step 5: Check if already invited
    const existingInvite = await SocietyInvite.findOne({
      Society: SocietyID,
      Invitee: InviteeID,
      Status: 'pending'
    });

    if (existingInvite) {
      return res.status(400).json({ error_message: 'User has already been invited' });
    }

    // Step 6: Create invite
    const invite = new SocietyInvite({
      ID: uuidv4(),
      Society: SocietyID,
      Inviter: inviterID,
      Invitee: InviteeID,
      Status: 'pending',
      CreatedAt: new Date()
    });

    await invite.save();

    res.status(201).json({ message: 'Invitation sent successfully', invite });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error_message: 'Failed to send invitation' });
  }
};

// Get all societies
exports.getAllSocieties = async (req, res) => {
  try {
    // Only fetch societies that are NOT private
    const societies = await Society.find({ 'Privacy.visibility': { $ne: 'private' } });

    // Add MembersCount for each society
    const societiesWithCount = await Promise.all(
      societies.map(async (society) => {
        const memberCount = await SocietyMember.countDocuments({ Society: society.ID });
        return {
          ID: society.ID,
          Name: society.Name,
          Description: society.Description,
          Category: society.Category,
          Image: society.Image,
          MembersCount: memberCount
        };
      })
    );

    res.status(200).json({ data: societiesWithCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: 'Failed to get societies' });
  }
};

// Create a society + add creator as admin member
exports.createSociety = async (req, res) => {
  try {
    const newSocietyId = uuidv4();
    const userId = jsonWebToken.verify_token(req.body.token)['id'];

    const newSociety = new Society({
      ID: newSocietyId,
      Name: req.body.name,
      Description: req.body.description,
      User: userId,
      Category: req.body.category,
      Visibility: req.body.visibility,
      Image: req.body.image,

      Privacy: req.body.privacy || {
        visibility: 'public',
        joinApproval: true,
        memberListVisible: true,
        eventsVisible: true
      },

      Permissions: req.body.permissions || {
        whoCanPost: 'all-members',
        whoCanCreateEvents: 'moderators',
        whoCanInvite: 'all-members'
      },

      Notifications: req.body.notifications || {
        newMemberNotifications: true,
        eventReminders: true,
        weeklyDigest: false,
        emailNotifications: true
      }
    });

    await newSociety.save();

    const newMember = new SocietyMember({
      ID: uuidv4(),
      Society: newSocietyId,
      User: userId,
      Role: "admin"
    });

    await newMember.save();
    res.status(201).json({ data: newSocietyId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create society" });
  }
};

// Delete society
exports.deleteSociety = async (req, res) => {
  try {
    const result = await Society.deleteOne({ ID: req.query.society_id });
    res.status(204).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete society" });
  }
};

// Get societies by user (created or member of)
exports.getSocietiesByUser = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.query.token)['id'];

    // Find societies created by user
    const createdSocieties = await Society.find({ User: userId });

    // Find societies where user is member
    const memberships = await SocietyMember.find({ User: userId }).select("Society Role");
    const memberSocietyIds = memberships.map(m => m.Society);
    const memberSocieties = await Society.find({ ID: { $in: memberSocietyIds } });

    // Combine and include roles
    const combined = [
      ...createdSocieties.map(s => ({ ...s.toObject(), Role: 'creator' })),
      ...memberSocieties.map(s => {
        const membership = memberships.find(m => m.Society === s.ID);
        return { ...s.toObject(), Role: membership?.Role || null };
      })
    ];

    res.status(200).json({ data: combined });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get societies for the user" });
  }
};

// Join society request
exports.joinSocietyRequest = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.body.token)['id'];

    // Check if the user already sent a join request
    const existingRequest = await SocietyJoinRequest.findOne({
      User: userId,
      Society: req.body.society_id,
      Status: { $in: ["pending", "approved"] } // Optional: include "approved" to prevent repeat joins
    });

    if (existingRequest) {
      return res.status(400).json({ error_message: "You have already requested to join this society." });
    }

    // Create new request
    const newRequest = new SocietyJoinRequest({
      ID: uuidv4(),
      Society: req.body.society_id,
      User: userId,
      Status: "pending"
    });

    const saved = await newRequest.save();
    res.status(201).json({ data: saved });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};

// Approve join request
exports.approveRequest = async (req, res) => {
  try {
    const request = await SocietyJoinRequest.findOne({ ID: req.body.request_id });
    if (!request) return res.status(404).json({ error_message: "Request not found" });

    request.Status = 'approved';
    await request.save();

    const newMember = new SocietyMember({
      ID: uuidv4(),
      Society: request.Society,
      User: request.User,
      Role: "member"
    });
    await newMember.save();

    // TODO: Send acceptance email here via mailer service

    res.status(204).json({ data: newMember });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to approve request" });
  }
};

// Reject join request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await SocietyJoinRequest.findOne({ ID: req.body.request_id });
    if (!request) return res.status(404).json({ error_message: "Request not found" });

    request.Status = 'rejected';
    await request.save();

    res.status(204).json({ data: request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to reject request" });
  }
};

// Get all join requests for a society
exports.getAllJoinRequests = async (req, res) => {
  try {
    const requests = await SocietyJoinRequest.find({ Society: req.query.society_id });
    // populate user info
    const userIds = requests.map(r => r.User);
    const users = await User.find({ ID: { $in: userIds } }).select("ID Name Email Photo");

    const data = requests.map(r => {
      const user = users.find(u => u.ID === r.User);
      return {
        Request_ID: r.ID,
        Status: r.Status,
        User_ID: user?.ID,
        User_Name: user?.Name,
        User_Email: user?.Email,
        User_Photo: user?.Photo
      };
    });

    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get join requests" });
  }
};

// Get all members of a society
exports.getAllMembers = async (req, res) => {
  try {
    const members = await SocietyMember.find({ Society: req.query.society_id });
    const userIds = members.map(m => m.User);
    const users = await User.find({ ID: { $in: userIds } }).select("ID Name Email Photo");
    const data = members.map(m => {
      const user = users.find(u => u.ID === m.User);
      return {
        ID: user?.ID,
        Name: user?.Name,
        Email: user?.Email,
        Photo: user?.Photo,
        Role: m.Role
      };
    });
    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get members" });
  }
};

// Remove member from society
exports.removeMember = async (req, res) => {
  try {
    const result = await SocietyMember.deleteOne({ Society: req.query.society_id, User: req.query.user_id });
    res.status(204).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to remove member" });
  }
};

// Check membership
exports.checkMembership = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.query.token)['id'];
    const isMember = await SocietyMember.exists({ User: userId, Society: req.query.society_id });
    res.status(200).json({ data: !!isMember });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to check membership" });
  }
};

// Check if user is an Admin
exports.checkAdmin = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.query.token)['id'];
    const isAdmin = await SocietyMember.exists({
      User: userId,
      Society: req.query.society_id,
      Role: 'admin'
    });

    res.status(200).json({ data: !!isAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to check admin status" });
  }
};

// Update society info
exports.updateInformation = async (req, res) => {
  try {
    const update = {
      Name: req.body.name,
      Description: req.body.description,
      Category: req.body.category,
      Privacy: req.body.privacy,
      Permissions: req.body.permissions,
      Notifications: req.body.notifications
    };

    if (req.body.privacy) update.Privacy = req.body.privacy;
    if (req.body.permissions) update.Permissions = req.body.permissions;
    if (req.body.notifications) update.Notifications = req.body.notifications;

    const result = await Society.updateOne({ ID: req.body.society_id }, update);
    res.status(204).json({ data: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to update society info" });
  }
};

// Update member role
exports.updateMemberRole = async (req, res) => {
  try {
    const result = await SocietyMember.updateOne(
      { User: req.body.member, Society: req.body.society_id },
      { Role: req.body.role }
    );
    res.status(204).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to update member role" });
  }
};

// Leave society
exports.leaveSociety = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.body.token)['id'];
    const result = await SocietyMember.deleteOne({ User: userId, Society: req.body.society_id });
    res.status(204).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to leave society" });
  }
};