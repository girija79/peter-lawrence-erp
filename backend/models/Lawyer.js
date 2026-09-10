const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema(
{
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true,
unique: true
},

fullName: {
  type: String,
  required: true
},

email: {
  type: String,
  required: true
},

phone: {
  type: String,
  default: ''
},

specialization: {
  type: String,
  default: ''
},

barRegistrationNo: {
  type: String,
  default: ''
},

experience: {
  type: Number,
  default: 0
},

status: {
  type: String,
  enum: ['Active', 'On Leave', 'Inactive'],
  default: 'Active'
},

joiningDate: {
  type: Date
}


},
{ timestamps: true }
);

module.exports = mongoose.model('Lawyer', lawyerSchema);
