const Group = require('../models/Group');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sendTemplatedEmail } = require('../services/emailService');
const { EMAIL_TYPES } = require('../utils/constants');
const { isValidEmail } = require('../utils/helpers');

/**
 * Create a new group
 */
const createGroup = async (req, res) => {
  try {
    const { name, description, currency } = req.body;

    if (!name) {
      return sendError(res, 'Group name is required', 400);
    }

    const group = await Group.create({
      name,
      description,
      currency: currency || 'USD',
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'admin',
        },
      ],
    });

    await group.populate('createdBy', 'name email');
    await group.populate('members.user', 'name email');

    return sendSuccess(res, 'Group created successfully', { group }, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get all groups for current user
 */
const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { createdBy: req.user._id },
        { 'members.user': req.user._id },
      ],
      isActive: true,
    })
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, 'Groups retrieved successfully', { groups });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get group by ID
 */
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');

    if (!group) {
      return sendError(res, 'Group not found', 404);
    }

    return sendSuccess(res, 'Group retrieved successfully', { group });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Update group
 */
const updateGroup = async (req, res) => {
  try {
    const { name, description, currency, settings } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (currency) updates.currency = currency;
    if (settings) updates.settings = { ...req.group.settings, ...settings };

    const group = await Group.findByIdAndUpdate(
      req.params.groupId,
      updates,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');

    return sendSuccess(res, 'Group updated successfully', { group });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Add member to group
 */
const addMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return sendError(res, 'Valid email is required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if already a member
    const isMember = req.group.members.some(
      (member) => member.user.toString() === user._id.toString()
    );

    if (isMember) {
      return sendError(res, 'User is already a member of this group', 400);
    }

    req.group.members.push({
      user: user._id,
      role: 'member',
    });

    await req.group.save();
    await req.group.populate('members.user', 'name email');

    // Send invitation email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const invitationUrl = `${process.env.FRONTEND_URL}/groups/${req.group._id}`;
      sendTemplatedEmail(EMAIL_TYPES.GROUP_INVITATION, user.email, {
        inviterName: req.user.name,
        groupName: req.group.name,
        invitationUrl,
      }).catch(console.error);
    }

    return sendSuccess(res, 'Member added successfully', { group: req.group });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Remove member from group
 */
const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (memberId === req.group.createdBy.toString()) {
      return sendError(res, 'Cannot remove group creator', 400);
    }

    req.group.members = req.group.members.filter(
      (member) => member.user.toString() !== memberId
    );

    await req.group.save();
    await req.group.populate('members.user', 'name email');

    return sendSuccess(res, 'Member removed successfully', { group: req.group });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Update member role
 */
const updateMemberRole = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;

    if (!['member', 'admin'].includes(role)) {
      return sendError(res, 'Invalid role', 400);
    }

    if (memberId === req.group.createdBy.toString()) {
      return sendError(res, 'Cannot change creator role', 400);
    }

    const member = req.group.members.find(
      (m) => m.user.toString() === memberId
    );

    if (!member) {
      return sendError(res, 'Member not found', 404);
    }

    member.role = role;
    await req.group.save();
    await req.group.populate('members.user', 'name email');

    return sendSuccess(res, 'Member role updated successfully', { group: req.group });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Delete group
 */
const deleteGroup = async (req, res) => {
  try {
    req.group.isActive = false;
    await req.group.save();

    return sendSuccess(res, 'Group deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  updateGroup,
  addMember,
  removeMember,
  updateMemberRole,
  deleteGroup,
};
