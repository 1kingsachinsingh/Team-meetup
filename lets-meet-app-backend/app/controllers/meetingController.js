const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const check = require('../libs/checkLib')

const emailLib = require('../libs/emailLib');

/* Models */
const MeetingModel = mongoose.model('Meeting')
const UserModel = mongoose.model('User')


/* Start getAllMeetingsFunction */
/* params: userId
*/

let getAllMeetingsFunction = (req, res) => {

    let findUserDetails = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.params.userId })
                .select()
                .lean()
                .exec((err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'Meeting Controller: findUserDetails', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.info('No User Found', 'Meeting  Controller:v')
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'User Details Found', 200, userDetails)
                        resolve(userDetails)
                    }
                })
        })
    }// end finduserDetails

    let findMeetings = (userDetails) => {
        return new Promise((resolve, reject) => {

            
            if (userDetails.isAdmin == 'true') {
                MeetingModel.find({ 'hostId': req.params.userId })
                    .select()
                    .lean()
                    .exec((err, meetingDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'Meeting Controller: findMeetings', 10)
                            let apiResponse = response.generate(true, 'Failed To Find Meetings', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(meetingDetails)) {
                            logger.info('No Meeting Found', 'Meeting  Controller:findMeetings')
                            let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                            reject(apiResponse)
                        } else {
                            let apiResponse = response.generate(false, 'Meetings Found and Listed', 200, meetingDetails)
                            resolve(apiResponse)
                        }
                    })

            }
            else {
                MeetingModel.find({ 'participantId': req.params.userId })
                    .select()
                    .lean()
                    .exec((err, meetingDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'Meeting Controller: findMeetings', 10)
                            let apiResponse = response.generate(true, 'Failed To Find Meetings', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(meetingDetails)) {
                            logger.info('No Meeting Found', 'Meeting  Controller:findMeetings')
                            let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                            reject(apiResponse)
                        } else {
                            let apiResponse = response.generate(false, 'Meetings Found and Listed', 200, meetingDetails)
                            resolve(apiResponse)
                        }
                    })

            }

        })
    }// end findMeetings


    findUserDetails(req, res)
        .then(findMeetings)
        .then((resolve) => {
            //let apiResponse = response.generate(false, 'Meetings Found and Listed', 200, resolve)
            res.send(resolve)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end getAllMeetingsFunction 



/*  Start getMeetingDetailsFunction */
/* params : meetingId
*/
let getMeetingDetailsFunction = (req, res) => {
    MeetingModel.findOne({ 'meetingId': req.params.meetingId })
    .select()
    .lean()
    .exec((err, meetingDetails) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'Meeting Controller: getMeetingDetails', 10)
            let apiResponse = response.generate(true, 'Failed To Find Meetings', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(meetingDetails)) {
            logger.info('No Meeting Found', 'Meeting  Controller:getMeetingDetailsFunction')
            let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Meeting Found', 200, meetingDetails)
            res.send(apiResponse)
        }
    })
}// end getMeetingDetailsFunction


/* Start Delete Meeting  */
/* params : meetingId
*/
let deleteMeetingFunction = (req, res) => {

    let findMeetingDetails = () => {
        return new Promise((resolve, reject) => {
            MeetingModel.findOne({ 'meetingId': req.params.meetingId })
                .select()
                .lean()
                .exec((err, meetingDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'Meeting Controller: findMeetingDetails', 10)
                        let apiResponse = response.generate(true, 'Failed To Find Meeting Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(meetingDetails)) {
                        logger.info('No Meeting Found', 'Meeting  Controller:findMeetingDetails')
                        let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                        reject(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'Meeting Details Found', 200, meetingDetails)
                        resolve(meetingDetails)
                    }
                })
        })
    }// end validate user input

    let deleteMeeting = (meetingDetails) => {
        return new Promise((resolve, reject) => {

            MeetingModel.findOneAndRemove({ 'meetingId': req.params.meetingId }).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Meeting Controller: deleteMeeting', 10)
                    let apiResponse = response.generate(true, 'Failed To delete Meeting', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No Meeting Found', 'Meeting Controller: deleteMeeting')
                    let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                    reject(apiResponse)
                } else {
                    let newMeetingObj = meetingDetails;

                    let sendEmailOptions = {
                        email: newMeetingObj.participantEmail,
                        name: newMeetingObj.participantName,
                        subject: `Your Meeting Has Been Canceled: ${newMeetingObj.meetingTopic}`,
                        html: `<h3> Meeting Canceled </h3>
                              <br> Hi , ${newMeetingObj.participantName} .
                              <br> ${newMeetingObj.hostName} canceled the meeting: ${newMeetingObj.meetingTopic}.
                            `
                    }

                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 2000);


                    let apiResponse = response.generate(false, 'Deleted the Meeting successfully', 200, result)
                    resolve(result)
                }
            });// end meeting model find and remove

        })
    }// end deleteMeeting function


    findMeetingDetails(req, res)
        .then(deleteMeeting)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Deleted the Meeting successfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end deleteMeetingFunction 


/* Start Update Meeting details */
/* params: meetingId
   body : meetingTopic,meetingStartDate,meetingEndDate,meetingDescription,meetingPlace
*/

let updateMeetingFunction = (req, res) => {

    let findMeetingDetails = () => {
        return new Promise((resolve, reject) => {
            MeetingModel.findOne({ 'meetingId': req.params.meetingId })
                .select()
                .lean()
                .exec((err, meetingDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'Meeting Controller: findMeetingDetails', 10)
                        let apiResponse = response.generate(true, 'Failed To Find Meeting Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(meetingDetails)) {
                        logger.info('No Meeting Found', 'Meeting  Controller:findMeetingDetails')
                        let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                        reject(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'Meeting Details Found', 200, meetingDetails)
                        resolve(meetingDetails)
                    }
                })
        })
    }// end findmeetingdetails

    let updateMeeting = (meetingDetails) => {
        return new Promise((resolve, reject) => {

            let options = req.body;
            MeetingModel.update({ 'meetingId': req.params.meetingId }, options).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Meeting Controller:updateMeeting', 10)
                    let apiResponse = response.generate(true, 'Failed To Update Meeting details', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No Meeting Found', 'Meeting Controller:updateMeeting')
                    let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                    reject(apiResponse)
                } else {

                    let newMeetingObj = meetingDetails;
                    let sendEmailOptions = {
                        email: newMeetingObj.participantEmail,
                        name: newMeetingObj.participantName,
                        subject: `Your Meeting Has Been Updated: ${options.meetingTopic}`,
                        html: `<h3> Your meeting has been modified! </h3>
                              <br> Hi , ${newMeetingObj.participantName} .
                              <br> ${newMeetingObj.hostName} Updated the meeting: ${options.meetingTopic}.
                              <br>
                                      
                              <div class="card" style="width: 18rem;">
                                  <div class="card-body">
                                      <h5 class="card-title">Agenda</h5>
                                      <p class="card-text">${options.meetingDescription}</p>
                                  </div>
                              </div>

                              <div class="card" style="width: 18rem;">
                                  <div class="card-body">
                                      <h5 class="card-title">When</h5>
                                      <p class="card-text">${options.meetingStartDate}</p>
                                  </div>
                              </div>
                              
                              <div class="card" style="width: 18rem;">
                                  <div class="card-body">
                                      <h5 class="card-title">Where</h5>
                                      <p class="card-text">${options.meetingPlace}</p>
                                  </div>
                              </div>
        
                              `
                    }

                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 2000);


                    let apiResponse = response.generate(false, 'Meeting details Updated', 200, result)
                    resolve(result)
                }
            });// end meeting model update

        })
    }// end updateMeeting function


    findMeetingDetails(req, res)
        .then(updateMeeting)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Meeting Updated', 200, "None")
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end updateMeetingFunction 



// start addMeetingFunction 
/* params: meetingTopic,hostId,hostName,participantId,participantName,participantEmail,
           meetingStartDate,meetingEndDate,meetingDescription,meetingPlace
*/

let addMeetingFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.meetingTopic && req.body.hostId && req.body.hostName &&
                req.body.participantId && req.body.participantName && req.body.meetingStartDate &&
                req.body.meetingEndDate && req.body.meetingDescription && req.body.meetingPlace) {
                resolve(req)
            } else {
                logger.error('Field Missing During Meeting Creation', 'meetingController: addMeeting()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input

    let addMeeting = () => {
        return new Promise((resolve, reject) => {
            //console.log(req.body)
            let newMeeting = new MeetingModel({
                meetingId: shortid.generate(),
                meetingTopic: req.body.meetingTopic,
                hostId: req.body.hostId,
                hostName: req.body.hostName,
                participantId: req.body.participantId,
                participantName: req.body.participantName,
                participantEmail: req.body.participantEmail,
                meetingStartDate: req.body.meetingStartDate,
                meetingEndDate: req.body.meetingEndDate,
                meetingDescription: req.body.meetingDescription,
                meetingPlace: req.body.meetingPlace,
                createdOn: time.now()
            })

            console.log(newMeeting)
            newMeeting.save((err, newMeeting) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'meetingController: addMeeting', 10)
                    let apiResponse = response.generate(true, 'Failed to add new Meeting', 500, null)
                    reject(apiResponse)
                } else {
                    let newMeetingObj = newMeeting.toObject();
                    //console.log(`${applicationUrl}/verify-email/${newUserObj.userId}`)
                    //Creating object for sending welcome email
                    let sendEmailOptions = {
                        email: newMeetingObj.participantEmail,
                        name: newMeetingObj.participantName,
                        subject: `Meeting Confirmed: ${newMeetingObj.meetingTopic}`,
                        html: `<h3> Your meeting is planned! </h3>
                              <br> Hi , ${newMeetingObj.hostName} has scheduled a meeting via Lets Meet.
                              <br>  

                            <div class="card" style="width: 18rem;">
                              <div class="card-body">
                                  <h5 class="card-title">Agenda</h5>
                                  <p class="card-text">${newMeetingObj.meetingDescription}</p>
                              </div>
                            </div>

                              
                            <div class="card" style="width: 18rem;">
                                <div class="card-body">
                                    <h5 class="card-title">When</h5>
                                    <p class="card-text">${newMeetingObj.meetingStartDate}</p>
                                </div>
                            </div>
                            
                            <div class="card" style="width: 18rem;">
                                <div class="card-body">
                                    <h5 class="card-title">Where</h5>
                                    <p class="card-text">${newMeetingObj.meetingPlace}</p>
                                </div>
                            </div>

                            `
                    }

                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 2000);

                    resolve(newMeetingObj)
                }
            })

        })
    }// end addMeeting function


    validateUserInput(req, res)
        .then(addMeeting)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Meeting Created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end addMeetingFunction 



//param : userId(Admin)
let sendReminderForTodaysMeetings = (req, res) => {

    let findUserDetails = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.body.userId })
                .select()
                .lean()
                .exec((err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'Meeting Controller: findUserDetails', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.info('No User Found', 'Meeting  Controller:v')
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'User Details Found', 200, userDetails)
                        resolve(userDetails)
                    }
                })
        })
    }// end finduserDetails

    let findMeetings = (userDetails) => {
        return new Promise((resolve, reject) => {
            if (userDetails.isAdmin == 'true') {
                MeetingModel.find({ 'hostId': req.body.userId })
                    .select()
                    .lean()
                    .exec((err, meetingDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'Meeting Controller: findMeetings', 10)
                            let apiResponse = response.generate(true, 'Failed To Find Meetings', 500, null)
                            reject(apiResponse)
                        } else if (check.isEmpty(meetingDetails)) {
                            logger.info('No Meeting Found', 'Meeting  Controller:findMeetings')
                            let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
                            reject(apiResponse)
                        } else {
                            let i=0;
                            for(let meeting of meetingDetails){
                                if(time.isSameDayAsToday(meeting.meetingStartDate) ){
                                    
                                    let sendEmailOptions = {
                                        email: meeting.participantEmail,
                                        name: meeting.participantName,
                                        subject: `Meeting Reminder: ${meeting.meetingTopic} with ${meeting.hostName}`,
                                        html: `<h1> Reminder of Your Meeting</h1>
                                              <br>
                                              <p> Just a reminder about your upcoming meeting Today <br>
                                              at <b> ${meeting.meetingStartDate} </b> at place <b> ${meeting.meetingPlace} </b>.
                                              </p>  
            
                
                                            `
                                    }
                                    i+=1;

                                    setTimeout(() => {
                                        emailLib.sendEmail(sendEmailOptions);
                                    }, 2000);
                                            
                                }
                            
                            }                            
                            if(i>0){
                                let apiResponse = response.generate(false, 'Meetings Found and sent reminders', 200, null)

                                resolve(apiResponse)
                                    
                            }
                            else{
                                let apiResponse = response.generate(true, 'No Meetings Today', 404, null)

                                reject(apiResponse)

                            }
        
                }
                    })

            }
        })
    }// end findMeetings


    findUserDetails(req, res)
        .then(findMeetings)
        .then((resolve) => {
            //let apiResponse = response.generate(false, 'Meetings Found and Listed', 200, resolve)
            res.send(resolve)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end getAllMeetingsFunction 


module.exports = {
    addMeetingFunction: addMeetingFunction,
    updateMeetingFunction: updateMeetingFunction,
    deleteMeetingFunction: deleteMeetingFunction,
    getAllMeetingsFunction:getAllMeetingsFunction,
    getMeetingDetailsFunction:getMeetingDetailsFunction,
    sendReminderForTodaysMeetings:sendReminderForTodaysMeetings

}// end exports