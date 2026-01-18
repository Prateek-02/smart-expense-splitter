const { sendError } = require('../utils/responseHandler');
const Group = require('../models/Group');

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 'Access denied. Admin privileges required.', 403);
  }
  next();
};

/**
 * Check if user is group admin or member
 */
const isGroupMember = async (req, res, next) => {
  try {
    const groupId = req.params.groupId || req.body.groupId;
    if (!groupId) {
      return sendError(res, 'Group ID is required', 400);
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return sendError(res, 'Group not found', 404);
    }

    const userId = req.user._id;
    const createdById = group.createdBy;
    
    // Check if user is the creator (using Mongoose's equals method for ObjectId comparison)
    const isCreator = createdById.equals(userId);
    
    // Check if user is in members array
    const isMember = group.members.some((member) => {
      if (!member.user) return false;
      // Handle both ObjectId and string comparisons
      if (member.user.equals) {
        return member.user.equals(userId);
      }
      return member.user.toString() === userId.toString();
    });

    if (!isCreator && !isMember) {
      return sendError(res, 'Access denied. You are not a member of this group.', 403);
    }

    req.group = group;
    req.isGroupAdmin = isCreator || group.members.some((member) => {
      if (!member.user) return false;
      const isUser = member.user.equals ? member.user.equals(userId) : member.user.toString() === userId.toString();
      return isUser && member.role === 'admin';
    });

    next();
  } catch (error) {
    console.error('Error in isGroupMember middleware:', error);
    return sendError(res, 'Error checking group membership', 500);
  }
};

/**
 * Check if user is group admin
 */
const isGroupAdmin = async (req, res, next) => {
  try {
    await isGroupMember(req, res, () => {
      if (!req.isGroupAdmin) {
        return sendError(res, 'Access denied. Group admin privileges required.', 403);
      }
      next();
    });
  } catch (error) {
    return sendError(res, 'Error checking group admin status', 500);
  }
};

module.exports = {
  isAdmin,
  isGroupMember,
  isGroupAdmin,
};
