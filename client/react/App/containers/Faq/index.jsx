import { before } from "lodash";
import React, { Component } from "react";

class Faq extends Component {
    constructor(props) {
        super(props);
        this.state = {
            faqItems: []
        }
    }

    // componentDidMount() {
    //     this.getFaqData();
    // }

    // getFaqData = () => {
    //     const self = this;
    //     fetch('../static/data/faq.json'
    //     ,{
    //       headers : { 
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json'
    //        }
    //     })
    //     .then(function(response){
    //         return response.json();
    //       })
    //       .then(function(myJson) {
    //         self.setState({faqItems: myJson});
    //       });
    // }

    render() {
        // const {faqItems} = this.state;
        return (
            <React.Fragment>
                <div className="main-content pb-5">
                    <div className="container">
                        <h2 className='text-center py-3'>FAQ</h2>
                        {/* {faqItems?.map(item => (
                            <>
                               <p style={{textTransform: "uppercase"}}><u><strong>{item.helpTopic}</strong></u></p>
                               {item.topicQA?.map(qaItem => (
                                            <p><strong>Q: {qaItem.question}</strong><br/>
                                            A: {qaItem.answer && qaItem.answer}{qaItem.externalUrl && <a href={qaItem.externalUrl} target="_blank">{qaItem.externalUrl}</a>}</p>
                                        )
                               )}
                            </>
                        ))} */}

                        <h5 className='text-center py-3' style={{textTransform: "uppercase"}}><u><strong>The Dashboard</strong></u></h5>

                        <p><strong>How do I navigate the dashboard?</strong> <a href='https://youtu.be/RwvVahCHnhA' target="_blank">https://youtu.be/RwvVahCHnhA</a></p>
                        <p>To navigate as a user within the dashboard in <em>Crew Pond</em>, from the <em>Dashboard</em> complete the following:</p>
                        <ol>
                            <li>Click the <em>Job Posts</em> tab to view jobs on offer.</li>
                            <li>Click the <em>Offers</em> tab to view offers I have made on jobs.</li>
                            <li>Click the <em>Contracts</em> tab to view the contracts I have been contracted to do, or contracts that are on offer to do for me.</li>
                            <li>Click the <em>Jobber Invites</em> link to view the jobs I have been invited to do.</li>
                        </ol>
                        <hr/>

                        <h5 className='text-center py-3' style={{textTransform: "uppercase"}}><u><strong>Creating a Job</strong></u></h5>

                        <p><strong>How do I create a job post?</strong> <a href='https://youtu.be/O_Baq9f5V2U' target="_blank">https://youtu.be/O_Baq9f5V2U</a></p>
                        <p>To create a new job in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond taskbar</em>, hover over the Jobs tab.<br/>The <em>Jobs</em> drop-down list displays.</li>
                            <li>Click <strong>Create</strong>.<br/>The <em>Job Details</em> screen displays.</li>
                            <li>In the <em>Job Details</em> screen, complete the following:<br/>
                                <ol>
                                    <li>In the <em>Coins</em> field, either select or enter the dollars per hour rate for the job.</li>
                                    <li>In the <em>Hourglass</em> field, select the rate type <em>(Hourly / Fixed)</em>.</li>
                                    <li>In the <em>Location Pin</em> field, select the job location (Australia / Remote).</li>
                                    <li>From the <em>Category</em> drop-down list, select the job category</li>
                                    <li>In the <em>Job Title</em> field, enter the job name.</li>
                                    <li>In the <em>Job Description</em> field, enter a description for the job.</li>
                                </ol>
                            </li>
                            <li>Enter schedules as per the <em>How to Add a Schedule</em> procedure.</li>
                            <li>Click <strong>Publish</strong>.</li>
                        </ol>
                        <hr/>

                        <p><strong>How do I add a schedule to a new job?</strong> <a href='https://youtu.be/OVxoVYV5eTY' target="_blank">https://youtu.be/OVxoVYV5eTY</a></p>
                        <p>To add a schedule in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond</em> taskbar hover over the <em>Jobs</em> tab, click <em>Create</em> and scroll down to the <em>Schedules</em> area of the screen.</li>
                            <li>Click the + icon.<br/>The <em>Schedules</em> details displays.</li>
                            <li>From the <em>New Schedule</em> window, complete the following:<br/>
                                <ol>
                                    <li>In the <em>Working Time</em> area of the screen, select the date.</li>
                                    <li>In the <em>Schedule Name</em> field, add the name of the schedule.</li>
                                    <li>In the <em>Working Time</em> area of the screen, select the <em>Start</em> and <em>End</em> times from the drop-down lists.</li>
                                    <li>Click <strong>Save</strong>.<br/>The <em>Job Title</em> screen displays with the new schedule in the <em>Schedules</em> area of the screen.</li>
                                </ol>
                            </li>
                            <li>Click <strong>Publish</strong></li>
                        </ol>
                        <hr/>

                        <p><strong>How do I update a schedule?</strong> <a href='https://youtu.be/5-cBKyxNKX8' target="_blank">https://youtu.be/5-cBKyxNKX8</a></p>
                        <p>To update a schedule in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard, Job Post Tab,</em> select the job for which you wish to edit the schedule.<br/>
                            The <em>Jobs</em> screen displays.</li>
                            <li>Scroll down to the schedule you wish to update.<br/>The schedules for the job display.</li>
                            <li>Click the Edit link.<br/>The <em>Edit Schedule</em> screen displays.</li>
                            <li>In the <em>Edit Schedule</em> screen, complete the following:<br/>
                                <ol>
                                    <li>In the <em>Schedule Name</em> field, change the schedule name as required.</li>
                                    <li>In the <em>Working Time</em> area of the screen, edit the start and end times as required.</li>
                                    <li>In the <em>Calendar</em> window, change the date as required.</li>
                                    <li>Click <strong>Save</strong></li>
                                </ol>
                            </li>
                            <li>Click the <em>I’m not a robot</em> checkbox, then <strong>Update</strong>.<br/>
                            The <em>job was updated successfully</em> message displays.</li>
                        </ol>
                        <hr/>

                        <p><strong>How do I make a job private?</strong> <a href='https://youtu.be/-2mbXTMA4bE' target="_blank">https://youtu.be/-2mbXTMA4bE</a></p>
                        <p>To make a job private in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click <em>Job Post</em>, then select the job you wish to make private. The job details display.</li>
                            <li>Click the pen icon at right of the job you have selected.<br/>The <em>Edit Job</em> screen displays.</li>
                            <li>Scroll down to the <em>Private</em> area of the screen (at the bottom), and click the slide switch to the <em>On</em> position.</li>
                            <li>Check the <em>I’m not a robot</em> checkbox, and click <strong>Update</strong>.</li>
                            <li>The <em>job was updated successfully</em> message displays.  Only selected / invited jobbers are now able to see the job, and the job is no longer open to the public.</li>
                        </ol>
                        <hr/>

                        <p><strong>How do I invite a jobber to my job posting?</strong> <a href='https://youtu.be/lQzF0390A64' target="_blank">https://youtu.be/lQzF0390A64</a></p>
                        <p>To invite a jobber to a job posting in Crew Pond, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click <em>Job Post</em>, then the job to which you are inviting the jobber.<br/>
                            The Job screen displays.</li>
                            <li>Click <strong>Invite</strong>.<br/>A list of jobbers displays.</li>
                            <li>You can either search for jobbers by entering a name in the <em>Search</em> field, or by clicking the <em>Favorite Jobbers</em> tab.</li>
                            <li>Once you have located your preferred jobber, click their avatar, then click <strong>Send Invite</strong>.<br/>
                            The <em>Select Schedules</em> screen displays.</li>
                            <li>From the <em>Select Schedules</em> screen, either click the <em>Select All</em> link to select all jobs, or click the radio button for the job required, then click <strong>Send</strong>.</li>
                            <li>A screen displays with the <em>Sent Invites</em> at the bottom of the screen.  The jobber receives the job invitation in their Inbox.</li>
                        </ol>
                        <hr/>

                        <p><strong>How do I assign a jobber to a schedule?</strong> <a href='https://youtu.be/2KqdcF2ZCeE' target="_blank">https://youtu.be/2KqdcF2ZCeE</a></p>
                        <p>To assign a jobber to a schedule in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond</em> dashboard, click <em>Contracts</em>.<br/>A list of jobs displays.</li>
                            <li>Click the job to be assigned.<br/>The <em>Job Details</em> screen displays.</li>
                            <li>Click <em>Schedules.</em>A list of schedules associated to the job displays.</li>
                            <li>Click the <strong>Assign</strong> button on the right side of the screen.<br/>A list of jobbers associated to the schedule displays.</li>
                            <li>Select the jobber and click <strong>Assign</strong>.<br/>The jobber is assigned to the schedule.</li>
                        </ol>
                        <hr/>

                        <p><strong>How do I unassign a jobber from a schedule?</strong> <a href='https://youtu.be/2KqdcF2ZCeE' target="_blank">https://youtu.be/2KqdcF2ZCeE</a></p>
                        <p>To unassign a jobber from a schedule in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond</em> dashboard, click <em>Contracts</em>.<br/>A list of jobs displays.</li>
                            <li>Click the job to be unassigned.<br/>The <em>Job Details</em> screen displays.</li>
                            <li>Click <em>Schedules.</em>A list of schedules associated to the job displays.</li>
                            <li>Click the down-arrow at the right of the schedule to be changed.<br/>A list of assigned jobbers displays.</li>
                            <li>Select the jobber to be unassigned, and click <strong>Unassign</strong>.</li>
                        </ol>
                        <hr/>

                        <h5 className='text-center py-3' style={{textTransform: "uppercase"}}><u><strong>Searching for Jobs</strong></u></h5>

                        <p><strong>How do I view my job posts?</strong> <a href='https://youtu.be/_StCO0AiTGA' target="_blank">https://youtu.be/_StCO0AiTGA</a></p>
                        <p>To view a job post in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click the Job Posts tab.<br/>A list of job posts displays.</li>
                            <li>Click the job post you wish to view.<br/>The <em>Job Post Details</em> screen displays.  From here you can view the job details such as Schedules, and you can also edit the job profile from this screen.</li>
                        </ol>
                        <hr/>

                        <h5 className='text-center py-3' style={{textTransform: "uppercase"}}><u><strong>Job Invites & Offers</strong></u></h5>

                        <p><strong>How do I view what jobs I have been invited to?</strong> <a href='https://youtu.be/GO50pH2oDW8' target="_blank">https://youtu.be/GO50pH2oDW8</a></p>
                        <p>To view a job invite in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click the <em>Jobber Invites</em> tab.<br/>A list of job invites displays.</li>
                            <li>Click the job invite you wish to view.<br/>The <em>Job Invite Details</em> screen displays.</li>
                            <li>Click <strong>Accept</strong>.<br/>The <em>Send Offer</em> screen displays.</li>
                            <li>In the <em>Send Offer</em> screen, complete the following:<br/>
                                <ol>
                                    <li>In the <em>Your Offer</em> screen, enter the rate you wish to charge.</li>
                                    <li>In the <em>Cover Letter</em> field, create your cover letter to send to the hirer</li>
                                    <li>In the <em>Schedules</em> area of the screen, highlight the radio button /s for the schedule / s you can work.</li>
                                    <li>Click <strong>Send</strong>.<br/>The job offer details are sent to the hirer.</li>
                                </ol>
                            </li>
                        </ol>
                        <hr/>

                        <p><strong>How do I view offers that I have made on job posts?</strong> <a href='https://youtu.be/kjHfCCSHklU' target="_blank">https://youtu.be/kjHfCCSHklU</a></p>
                        <p>To view a job offer in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click the Offers tab.<br/> A list of offers for jobs you have submitted displays.</li>
                            <li>Click the job offer you wish to view.<br/>The <em>Job Details</em> screen displays.</li>
                            <li>Scroll to the <em>Offers</em> area of the screen to view your offers.</li>
                        </ol>
                        <hr/>

                        <p><strong>How do I make an offer on a job?</strong> <a href='https://youtu.be/-O0nlydgd6Y' target="_blank">https://youtu.be/-O0nlydgd6Y</a></p>
                        <p>To make a job offer in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, hover over the <em>Jobs</em> tab.<br/>
                            The <em>Jobs</em> drop-down list displays.</li>
                            <li>Click <em>Search</em>.<br/>A list of all jobs available to the public displays.</li>
                            <li>Select the job you wish to offer.<br/>The <em>Job Details</em> screen displays.</li>
                            <li>View the job, and click <strong>Send Offer</strong>.The <em>Send Offer</em> screen displays.</li>
                            <li>In the <em>Send Offer</em> screen, complete the following:<br/>
                                <ol>
                                    <li>In the <em>Your Offer</em> field, enter the dollar rate for the job.</li>
                                    <li>From the <em>Schedules</em> area of the screen, select the schedules you can work.</li>
                                    <li>In the <em>Cover Letter</em> area of the screen, enter your cover letter.</li>
                                    <li>Click <strong>Send</strong>.<br/>The <em>Sent offer successfully</em> message displays.</li>
                                </ol>
                            </li>
                        </ol>
                        <hr/>

                        <p><strong>How do I accept a jobber’s offer?</strong> <a href='https://youtu.be/9CIkHLLhkFs' target="_blank">https://youtu.be/9CIkHLLhkFs</a></p>
                        <p>To accept a jobber’s offer in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click <em>Job Posts</em>.<br/>The Job Details screen displays.</li>
                            <li>Click the job to offer, and scroll down to the <em>Offers</em> area of the screen.</li>
                            <li>Click the jobber whose offer you wish to accept.<br/>The <em>Offer Detail</em> screen displays.</li>
                            <li>View the offer details, and click <strong>Accept Offer</strong>.</li>
                        </ol>
                        <hr/>

                        <h5 className='text-center py-3' style={{textTransform: "uppercase"}}><u><strong>Job Contracts</strong></u></h5>

                        <p><strong>How do I view my contracts?</strong> <a href='https://youtu.be/48jbZ7fnKpE' target="_blank">https://youtu.be/48jbZ7fnKpE</a></p>
                        <p>To view a contract in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click the <em>Contracts</em> tab.<br/><em>Crew Pond</em> displays all contracts running under my name.</li>
                            <li>Select the contract required.<br/>The <em>Contract Details</em> screen displays.</li>
                        </ol>
                        <hr/>

                        <h5 className='text-center py-3' style={{textTransform: "uppercase"}}><u><strong>My Calendar</strong></u></h5>

                        <p><strong>How do I navigate My Calendar?</strong> <a href='https://youtu.be/SWdIQ14rr6o' target="_blank">https://youtu.be/SWdIQ14rr6o</a></p>
                        <p>To navigate my calendar in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond</em> taskbar, click the <em>My Calendar</em> tab.<br/> The <em>Calendar</em> window displays.</li>
                            <li>From the <em>Calendar</em> window, click <em>All Jobs</em>, or select a job from the drop-down list.</li>
                            <li>Click the <em>Date</em> tab to search for jobs by date.</li>
                            <li>Click the <em>Week</em> tab to select the calendar view you require.  The options are:<br/>
                                <ol>
                                    <li>Day</li>
                                    <li>Week</li>
                                    <li>2-weeks</li>
                                    <li>4-weeks</li>
                                    <li>Year</li>
                                </ol>
                            </li>
                            <li>You can view a list of all jobbers on the left-hand side of the screen. These can be filtered in the following way:<br/>
                                <ol>
                                    <li>All</li>
                                    <li>Full-Time</li>
                                    <li>Company /Sole Trader</li>
                                    <li>Casual</li>
                                </ol>
                            </li>
                        </ol>
                        <p style={{color: "red"}}>NOTE:	You can search for jobbers by typing their name in the <em>Search Jobber Name</em> field, and also by category and location.</p>
                        <hr/>

                        <p><strong>How do I invite a jobber to my job posting in My Calendar?</strong> <a href='https://youtu.be/_71cY4JloQ4' target="_blank">https://youtu.be/_71cY4JloQ4</a></p>
                        <p>To invite a jobber to your job posting in your <em>Crew Pond</em> calendar, complete the following</p>
                        <ol>
                            <li>From the <em>Crew Pond</em> taskbar, click the <em>My Calendar</em> tab.<br/> The <em>Calendar</em> window displays.</li>
                            <li>Search for the jobber your wish to invite to your job posting by scrolling to the name on the left side of the screen.<br/>
                            <span style={{color: "red"}}>NOTE:	You can view the invoice from this screen, by clicking the download icon at bottom right of the screen.</span></li>
                            <li>Once you have located the jobber, select their avatar and drag and drop it onto the schedule required.<br/>
                            <em>The Your edits have not been saved.  Please publish your edits before leaving the page or they will be lost.</em></li>
                            <li>Click <strong>OK</strong> to accept the message.</li>
                            <li>In the top right hand corner of the calendar screen, click <strong>Publish Schedule Updates.</strong><br/>
                            The <em>You have successfully updated your schedule(s) with new jobber invites</em> message appears.</li>
                            <li>Click <strong>OK</strong> to accept the message</li>
                        </ol>
                        <p style={{color: "red"}}>NOTE:	You can search for jobbers by typing their name in the <em>Search Jobber Name</em> field, and also by category and location.</p>
                        <hr/>

                        <p><strong>How do I add a schedule to my job in My Calendar?</strong> <a href='https://youtu.be/_71cY4JloQ4' target="_blank">https://youtu.be/_71cY4JloQ4</a></p>
                        <p>To add a schedule to my job calendar in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond</em> taskbar, click the <em>My Calendar</em> tab.<br/> The <em>Calendar</em> window displays.</li>
                            <li>Select the job name for which you are adding the schedule, and click the <em>Plus</em> icon.<br/>The <em>Add Schedule</em> screen displays.</li>
                            <li>Scroll down to the <em>Schedules</em> area of the screen and click the <em>Plus</em> icon.<br/>The <em>New Schedule</em> screen displays on the right side of the screen.</li>
                            <li>In the New Schedule screen, complete the following:<br/>
                                <ol>
                                    <li>In the <em>Schedule Name</em> field, enter the new schedule name.</li>
                                    <li>In the <em>Calendar</em>, select the date for the new schedule.</li>
                                    <li>In the <em>Working Time</em> area of the screen, click the <em>Plus</em> icon.</li>
                                    <li>Add start and end times.</li>
                                    <li>Click <strong>Save</strong>.</li>
                                </ol>
                            </li>
                            <li>Click <strong>Update</strong>.<br/><em>The job was updated successfully</em> message displays in the top right corner.</li>
                        </ol>
                        <p style={{color: "red"}}>NOTE:	You can search for jobbers by typing their name in the <em>Search Jobber Name</em> field, and also by category and location.</p>
                        <hr/>

                        <p><strong>How do I edit my job posting in My Calendar?</strong> <a href='https://youtu.be/itU-4STRjIA' target="_blank">https://youtu.be/itU-4STRjIA</a></p>
                        <p>To edit a schedule in my job calendar in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond</em> taskbar, click the <em>My Calendar</em> tab.<br/> The <em>Calendar</em> window displays.</li>
                            <li>Select the job name for which you are editing the schedule, and click the <em>Pen</em> icon.<br/>
                            The <em>Edit Schedule</em> screen displays.</li>
                            <li>In the <em>Edit Schedule</em> screen, complete the following to edit the schedule<br/>
                                <ol>
                                    <li>In the <em>Category</em> field, edit the job category as required.</li>
                                    <li>In the <em>Job Title</em> field, edit the job title as required.</li>
                                    <li>In the <em>Job Description</em> field, edit the job description as required.<br/>
                                    <span style={{color: "red"}}>NOTE:	You can also edit schedules, SOS Urgent Staff and set the job to private as required.</span>
                                    </li>
                                </ol>
                            </li>
                            <li>Click <strong>Update</strong></li>
                        </ol>
                        <hr/>

                        <p><strong>How do I get my ICS Feed URL so I can subscribe to my personal device’s calendar app ?</strong> <a href='https://youtu.be/L2EbN8Titgs' target="_blank">https://youtu.be/L2EbN8Titgs</a></p>
                        <p>To retrieve your ICS Feed URL to subscribe to your personal device’s calendar app, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond</em> taskbar, click the <em>My Calendar</em> tab.<br/> The <em>Calendar</em> window displays.</li>
                            <li>Scroll to the bottom of the screen, and click the <em>ICS Feed</em> link.<br/>The <em>ICS Feed URL</em> displays.</li>
                            <li>Click <em>Copy</em> beside the link.<br/>The URL can then be posted into any calendar app you use.</li>
                        </ol>
                        <hr/>

                        <h5 className='text-center py-3' style={{textTransform: "uppercase"}}><u><strong>Chats</strong></u></h5>

                        <p><strong>How do I create a job group chat?</strong> <a href='https://youtu.be/m1uZjvOO7E0' target="_blank">https://youtu.be/m1uZjvOO7E0</a></p>
                        <p style={{color: "red"}}>NOTE:	Only the hirer can perform this activity.</p>
                        <p>To create a chat with a crew within a job, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click <em>Job Posts</em>.</li>
                            <li>Click the job for which you wish to create the group chat.<br/>The jobs screen displays.</li>
                            <li>From the <em>Jobs</em> screen, navigate to the job for which you wish the chat to be created, and click the <em>Chat</em> icon.<br/>The <em>New Chat</em> screen displays.</li>
                            <li>In the <em>New Chat</em> screen, complete the following:<br/>
                                <ol>
                                    <li>Click the avatar of the person / group you’d like to invite to the chat.</li>
                                    <li>In the <em>Chat Name</em> field, enter the chat name.</li>
                                    <li>Click <strong>Create.</strong><br/>The new chat displays in the Dashboard screen, and is available for use.</li>
                                </ol>
                            </li>
                        </ol>
                        <hr/>

                        <h5 className='text-center py-3' style={{textTransform: "uppercase"}}><u><strong>Invoices</strong></u></h5>

                        <p><strong>How do I create an invoice or timesheet?</strong> <a href='https://youtu.be/pXbqvrsel4Y' target="_blank">https://youtu.be/pXbqvrsel4Y</a></p>
                        <p>To create an invoice and timesheet in Crew Pond, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click <em>Contracts</em>.</li>
                            <li>Click the contract for which you are creating the invoice.<br/>The invoice for the contract you have selected displays.</li>
                            <li>Click <em>Work Hours</em> from the lower half of the screen, then click <strong>Add Working Hours</strong>.<br/> The <em>Log Working Hours</em> screen displays.</li>
                            <li>In the <em>Log Working Hours</em> screen, complete the following:<br/>
                                <ol>
                                    <li>Select your work activity from the <em>Schedule Name</em> drop-down list.</li>
                                    <li>In the <em>Working Time</em> area of the screen, select your start and end times from the drop-down lists.</li>
                                    <li>Click the <strong>Add break time</strong> button to add breaks.</li>
                                    <li>From the <em>Break Time</em> area of the screen, select your break from the drop-down list, and add the start and end time of the break.</li>
                                </ol>
                            </li>
                            <li>In the <em>Calendar</em> area of the screen, select the day, month and year of the day you worked, and click <strong>Publish</strong>.<br/>
                            The <em>Worktime was added successfully</em> message displays, along with a screen displaying your hour rate, the date on which you worked.</li>
                            <li>In the lower half of this screen, click <em>Invoices</em>, then <strong>Generate Invoice – Timesheet</strong>.<br/>The <em>Send Invoice</em> screen displays.</li>
                            <li>In the Send Invoice screen, complete the following:<br/>
                                <ol>
                                    <li>Select radio button for the schedules you wish to send in the invoice from the bottom of this screen.</li>
                                    <li>In the <em>You Are</em> field, select your worker type from the drop-down list.</li>
                                    <li>In the <em>Invoice No.</em> field, enter your invoice number.  (optional)</li>
                                    <li>In the <em>ABN</em> field, enter your 11-digit ABN. (if applicable.)</li>
                                    <li>From the <em>Payment Details</em> drop-down list, select your payment type.</li>
                                    <li>In the <em>Account Number</em> field, add your account details.</li>
                                    <li>Click <strong>Send</strong>.<br/>
                                    <em>Crew Pond</em> sends the invoice to the hirer. The <em>Sent Invoice Successfully</em> message displays, and the newly created invoice displays at the bottom of the screen.</li>
                                </ol>
                            </li>
                        </ol>
                        <p style={{color: "red"}}>NOTE:	You can view the invoice from this screen, by clicking the download icon at bottom right of the screen.</p>
                        <hr/>

                        <h5 className='text-center py-3' style={{textTransform: "uppercase"}}><u><strong>My Profile</strong></u></h5>

                        <p><strong>How do I edit my profile?</strong> <a href='https://youtu.be/EEk9VAy8uyw' target="_blank">https://youtu.be/EEk9VAy8uyw</a></p>
                        <p>To edit a profile in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond</em> taskbar, click your name and avatar.<br/>A drop-down list displays.</li>
                            <li>From the drop-down list, select <em>View Profile</em>.<br/>The <em>Profile</em> screen displays.</li>
                            <li>Click the pen icon at the top right-hand side of the screen.<br/>The <em>Edit Profile</em> screen displays.</li>
                            <li>From the <em>Edit Profile</em> screen, complete the following:<br/>
                                <ol>
                                    <li>In the <em>First Name</em> field, edit your first name.</li>
                                    <li>In the <em>Last Name</em> field, edit your last name.</li>
                                    <li>In the <em>Lives In</em> field, edit your location.</li>
                                    <li>In the <em>Experience</em> drop-down, select your experience in years and months.</li>
                                    <li>In the <em>Company</em> field, enter your company name.</li>
                                    <li>Edit your <em>Status</em> by clicking the sliding button on or off.</li>
                                    <li>In the <em>Skills</em> area of the screen, click the plus icon to add skills.</li>
                                    <li>In the <em>Type</em> area, select your worker type from the drop-down list.</li>
                                    <li>Click the <strong>Save</strong> button.<br/>The <em>Success</em> message displays, and the number of jobs you have completed and your success rate displays.</li>
                                </ol>
                            </li>
                        </ol>
                        <hr/>

                        <h5 className='text-center py-3' style={{textTransform: "uppercase"}}><u><strong>Payment Details</strong></u></h5>

                        <p><strong>How do I add my payment details? </strong> <a href='https://youtu.be/MFHuPlGywjo' target="_blank">https://youtu.be/MFHuPlGywjo</a></p>
                        <p>To add payment details in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click your avatar and name.<br/>A drop-down menu displays.</li>
                            <li>Click <em>Payment Options</em>.<br/>The <em>Make Payments</em> screen displays.</li>
                            <li>Click the <strong>Add a Card</strong> button.<br/>The <em>Card</em> screen displays.</li>
                            <li>In the <em>Card</em> screen, complete the following:<br/>
                                <ol>
                                    <li>In the <em>Card Number</em> field, enter your 16-digit credit card number.</li>
                                    <li>In the <em>Expiry date</em> field, enter the expiry date. (MM/YY)</li>
                                    <li>In the <em>CVV Code</em> field, enter your 3-digit CVV.</li>
                                    <li>Click the <em>I’m not a robot</em> checkbox.</li>
                                    <li>Click the <strong>Save</strong> button.</li>
                                </ol>
                            </li>
                        </ol>
                        <p style={{color: "red"}}>NOTE:	You can also delete card details from this screen.</p>
                        <hr/>

                        <p><strong>How do I receive payments? </strong> <a href='https://youtu.be/MFHuPlGywjo' target="_blank">https://youtu.be/MFHuPlGywjo</a></p>
                        <p>To receive payments in <em>Crew Pond</em>, complete the following:</p>
                        <ol>
                            <li>From the <em>Crew Pond Dashboard</em>, click your avatar and name.<br/>A drop-down menu displays.</li>
                            <li>Click <em>Payment Options</em>.<br/>The <em>Receive Payments</em> screen displays.</li>
                            <li>Click the <strong>Add a Bank</strong> button.<br/>The <em>Add a Bank Account</em> screen displays.</li>
                            <li>In the <em>Add a Bank Account</em> screen, complete the following:<br/>
                                <ol>
                                    <li>In the <em>BSB</em> field, enter your 6-digit BSB.</li>
                                    <li>In the <em>Account Number</em> field, enter your account number.</li>
                                    <li>Click the <em>I’m not a robot</em> checkbox.</li>
                                    <li>Click the <strong>Save</strong> button.</li>
                                </ol>
                            </li>
                        </ol>
                        <p style={{color: "red"}}>NOTE:	You can also delete bank accounts from this screen.</p>
                        <hr/>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Faq;