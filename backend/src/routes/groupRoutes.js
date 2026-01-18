const express = require('express');
const router = express.Router();
const {
  createGroup,
  getMyGroups,
  getGroupById,
  updateGroup,
  addMember,
  removeMember,
  updateMemberRole,
  deleteGroup,
} = require('../controllers/groupController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isGroupMember, isGroupAdmin } = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authenticate);

router.post('/', createGroup);
router.get('/my-groups', getMyGroups);
router.get('/:groupId', isGroupMember, getGroupById);
router.put('/:groupId', isGroupMember, isGroupAdmin, updateGroup);
router.delete('/:groupId', isGroupMember, isGroupAdmin, deleteGroup);

// Member management
router.post('/:groupId/members', isGroupMember, isGroupAdmin, addMember);
router.delete('/:groupId/members/:memberId', isGroupMember, isGroupAdmin, removeMember);
router.put('/:groupId/members/:memberId/role', isGroupMember, isGroupAdmin, updateMemberRole);

module.exports = router;
