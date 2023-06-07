const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ROLES } = require('#config');

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.REGULAR_USER,
  },
  bossId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  subordinates: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

module.exports = mongoose.model('User', UserSchema);
