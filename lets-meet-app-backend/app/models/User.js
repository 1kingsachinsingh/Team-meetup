'use strict' 
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;
 
let userSchema = new Schema({
  userId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    default: ''
  },
  countryName: {
    type: String,
    default: ''
  },
  mobileNumber: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: String,
    default: 'false'
  },
  status:{
    type:String,
    default:'offline'
  },
  password: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  validationToken: { //will generate automatically while resetting password
    type: String,
    default: ''
  },
  emailVerified:{
    type:String,
    default:'No'
  },
  createdOn :{
    type:Date,
    default:""
  }


})


mongoose.model('User', userSchema);