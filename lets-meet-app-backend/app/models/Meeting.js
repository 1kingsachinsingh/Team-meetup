'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;
 
let meetingSchema = new Schema({
  meetingId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  meetingTopic: {
    type: String,
    default: ''
  },

  hostId: {
    type: String,
    default: ''
  },
  hostName: {
    type: String,
    default: ''
  },
  
  participantId: {
    type: String,
    default: ''
  },
  participantName: {
    type: String,
    default: ''
  },
  participantEmail: {
    type: String,
    default: ''
  },

  meetingStartDate: {
    type: Date,
    default: ''
  },
  meetingEndDate: {
    type: Date,
    default: ''
  },

  meetingDescription: {
    type: String,
    default: 'false'
  },

  meetingPlace: {
    type: String,
    default: ''
  },
  createdOn :{
    type:Date,
    default:""
  }


})


mongoose.model('Meeting', meetingSchema);