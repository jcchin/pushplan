new_notification = function(huddle_id, type, subject) {
    var h = Huddles.findOne({_id: huddle_id});
    if(h) {
        var notify = {
            //to: h.participants, 
            to: _.map(h.invites,function(invite) {return invite.invitee}),
            huddle_id: huddle_id, 
            type:type,
            seen: [], 
            created_at: new Date(),
            subject: subject
        };
        Notify.insert(notify);
    }
}


Meteor.methods({
  new_huddle: function(name){
      var user_self = Meteor.user();
      if (name) {
          var huddle = {}
          huddle['name'] = name;
          huddle.details = "Send the url above to invite people to this group. Click the pencil next to this text to modify the group details..."
          huddle.date_time = new Date();
          huddle.date_time.setHours(19);
          huddle.created_by = user_self._id;
          
          //auto invite self to huddle
          var invite;

          invite = {
              created_at: new Date(), 
              invitee: user_self._id
          }
          
          //Invitations.insert(invite);
          huddle.invites = [invite,];
          huddle.messages = [];
          huddle.participants = [];
          huddle.polls = [
              {type:'vote', name: 'ideas', desc:'', index:0}, 
          ];
          huddle.decision = [false,]
          var huddle_id = Huddles.insert(huddle);
          //create shortened invite link
          //var longUrl = Meteor.absoluteUrl().replace('http', 'https')+'huddles/'+huddle_id;
          //var shortUrl = Bitly.shortenURL('www.google.com');
          // if(shortUrl){
          //  huddle.url = shortUrl
          // }else{
          //   huddle.url = longUrl
          // }
          return huddle_id;
      }
  },
  new_poll: function(huddle_id, poll){
    if (poll && poll.name) {
      var h = Huddles.findOne({_id:huddle_id});
      poll.index = h.polls.length;
      if(poll.type==="vote") {
        Huddles.update({_id:huddle_id}, {$push:{polls:poll,decision:false}});
      }else if(poll.type==="time"){
        Huddles.update({_id:huddle_id}, {$push:{polls:poll,decision:false}});
        //given date list, start hour, end hour; built 2d array of options
        for (var i=poll.start; i<poll.end; ++i){
          for(var j=0; j<poll.dates.length; ++j){
            var datetime = poll.dates[j];
            var base_hr = i+poll.offset;
            var newDate
            if (base_hr > 23) {
              newDate = new Date();
              newDate.setUTCDate(datetime.getUTCDate()+1);
            }
            else {
              newDate = new Date(poll.dates[j]);
              //console.log(base_hr, newDate)
            }

            var hr_adjust = base_hr%24; //account for the timezone of the user
            newDate.setUTCHours(hr_adjust);
            newDate.setUTCMinutes(0);
            newDate.setUTCSeconds(0);
            //console.log(datetime)
            //console.log("foo", i, poll.offset ,datetime);
            var idea = {
              datetime:newDate,
              huddle_id:huddle_id,
              poll:poll.index,
              votes: {},
              score: 0,
              created_at: new Date()
            }
            //console.log(poll.dates[j], newDate)

            Ideas.insert(idea);
          }
        }
      }else if(poll.type==="rowing"){
        Huddles.update({_id:huddle_id}, {$push:{polls:poll,decision:false}});
      }
    }
  },
  new_idea: function(huddle_id, poll, idea){
      idea.huddle_id = huddle_id; 
      idea.created_by = Meteor.userId();
      idea.poll = poll;
      idea.votes = {};
      idea.score = 0;
      idea.created_at = new Date();
      var huddle = Huddles.findOne({_id:huddle_id});
      idea.type = huddle.polls[poll].type;
      if (idea.type==="rowing"){
        idea.cox_score = 0;
      }
      Ideas.insert(idea);

      new_notification(huddle_id, 'idea', poll);
  },
  new_message: function(huddle_id, message){
    message['huddle_id'] = huddle_id;
    var user = Meteor.user();
    message['author'] = user._id;
    message.created_at = Date.now();
    Huddles.update({_id:huddle_id},{$addToSet:{messages:message}});
    new_notification(huddle_id, 'message')
  },
  decide: function(idea_id){
    var i = Ideas.findOne({_id:idea_id}); 
    var query = {}; 
    query['decision.'+i.poll] = idea_id;
    query.updated_at = new Date();
    Huddles.update({_id:i.huddle_id}, {$set:query});
  },
  reopen: function(huddle_id, pollIndex){
    var huddle = Huddles.findOne({_id:huddle_id});
    var query = {};
    query['decision.'+pollIndex] = false;
    query['updated_at'] = new Date();
    //console.log(query);
    Huddles.update({_id:huddle._id}, {$set:query});
  }, 
  notify: function(huddle_id){
    var huddle = Huddles.findOne({_id:huddle_id});
    var ideas = Ideas.find({huddle_id:huddle_id}).fetch();
    var decision = Ideas.findOne({_id:huddle.decision});
    
    var users = Meteor.users.find({_id: {$in: huddle.participants}}).fetch();

    var recip=[]; //email recipients
    for(var i=0; i<users.length; i++){ //extract all emails
      recip.push(users[i].emails[0].address)
    }

    var email_context2 = {invitor: displayName(), 
        url: Meteor.absoluteUrl("huddles/") + huddle_id, //.replace("http:","https:")
        huddle_id: huddle_id,
        huddle_name: huddle.name,
        recip: recip,
        idea: decision.name
        }
    
    Email.send({
          from: "noreply@pushplan.net", 
          to: recip,
          subject: huddle.name+" decided!", 
          text: huddle.name+" has decided on "+decision.name,
          html: Handlebars.templates['notification_email'](email_context2),
        });
  },
  mobileNotify: function(phoneType, emailString, user){
    console.log('emailin')
    var emailArray=[];
    _.each(Meteor.user().emails, function(email, index){
      emailArray.push(email.address);
    });

    Email.send({
          from: "noreply@pushplan.net", 
          to: "pushplanteam@gmail.com",
          subject: user.username+" wants an "+phoneType+ " app!", 
          text: user.username+" wants a "+phoneType+ " app!, userID: "+ user._id+" email: "+ emailArray+ " signup email: "+ emailString
        });
  },  
  invite: function(huddle_id){
    
    var userId = Meteor.userId();
    if (userId) {
      var h = Huddles.findOne({_id:huddle_id});
      if (h){
        for (var i=0; i < h.invites.length; i++){
          if(h.invites[i].invitee == userId){
            h.invites[i].active = true; 
            Huddles.update({_id:huddle_id}, h);
            return;
          }
        }
      }
      var invite = {
          created_at: new Date(), 
          invitee: userId
      }
      Huddles.update({_id: huddle_id}, {$push:{invites:invite}});
      new_notification(huddle_id, 'invite', userId);
      
    }
  }, 
  leave: function(huddle_id) {
    var userId = Meteor.userId();
    if (userId) {
      Huddles.update({_id:huddle_id},{$pull:{invites:{invitee:userId}, participants:userId}});
      Notify.remove({subject:userId});

      //reset votes and recalculate score
      var array_of_idea_objects = Ideas.find({huddle_id:huddle_id}).fetch();
      _.each(array_of_idea_objects ,function(idea, index){
        if (idea.type==="rowing"){
          var new_votes = _.omit(idea.votes, userId);     
          var new_score = _.reduce(_.values(new_votes),function(memo,num){
            if (num > -2 && num !=null){
              return memo+1;
            }
            return memo;
          },0);
        var new_cox_score = _.reduce(_.values(new_votes),function(memo,num){
          if (num == -2){
            return memo+1;
          }
          return memo;
        },0);
        Ideas.update({_id:idea._id},{$set:{votes:new_votes, score:new_score, cox_score:new_cox_score}});
        }else{
          var new_votes = _.omit(idea.votes, userId);      
          var new_score = _.reduce(_.values(new_votes),function(memo,num){return memo+num},0);
          Ideas.update({_id:idea._id},{$set:{votes:new_votes, score:new_score}});
        }
      });
    }
  },
  reset_votes: function(huddle_id, pollIndex){
    var array_of_idea_objects = Ideas.find({huddle_id:huddle_id, poll:pollIndex}).fetch();
    var array_of_votes = [];
    var u_id = Meteor.userId();
    if (array_of_idea_objects[0].type==="rowing"){ //special handling for rowers
      _.each(array_of_idea_objects ,function(idea, index){
        var new_votes = _.omit(idea.votes, u_id);      
        var new_score = _.reduce(_.values(new_votes),function(memo,num){
          if (num > -2 && num !=null){
            return memo+1;
          }
          return memo;
        },0);
        var new_cox_score = _.reduce(_.values(new_votes),function(memo,num){
          if (num == -2){
            return memo+1;
          }
          return memo;
        },0);
        Ideas.update({_id:idea._id},{$set:{votes:new_votes, score:new_score, cox_score:new_cox_score}});
      });
    }else{
      _.each(array_of_idea_objects ,function(idea, index){
        var new_votes = _.omit(idea.votes, u_id);      
        var new_score = _.reduce(_.values(new_votes),function(memo,num){return memo+num},0);
        Ideas.update({_id:idea._id},{$set:{votes:new_votes, score:new_score}});
      });
    }
    Huddles.update({_id:huddle_id},{$pull:{participants:u_id}});
  },
  update_user: function(username, real_name){ 
    var update = {
        username:username, 
        "profile.name": real_name,
    };
    Meteor.users.update({_id: Meteor.userId()}, {$set:update});
  }
});