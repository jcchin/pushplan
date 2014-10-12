var admins = ['justingray', 'jeff'];


Meteor.publish("huddles", function (admin_flag) {
  var userId = this.userId;
  if (userId) {
    var user = Meteor.users.findOne({_id:userId});

    if(admin_flag && admins.indexOf(user.username) >= 0 ) {
      return Huddles.find();
    }

    return Huddles.find({'invites':{$elemMatch:{'invitee':userId, 'active':{$ne:false}}}}); 
  }
});

Meteor.publish('huddle', function(huddle_id){
  return Huddles.find({'_id':huddle_id});
});

Meteor.publish("ideas", function (huddle_id, poll) {
  if (poll){
    var ideas = Ideas.find({'huddle_id':huddle_id, poll:poll});
  }else {
    var ideas = Ideas.find({'huddle_id':huddle_id});
  }
  return ideas; 
});

Meteor.publish("directory", function () {
  return Meteor.users.find();
});

Meteor.publish("userStatus", function () {
  return Meteor.users.find({'status.online':true});
});

Meteor.publish('notify', function() {
  return Notify.find({to:{$in:[this.userId]}});
})


Accounts.onCreateUser(function(options, user){
    if (user.username) {
      user.username = user.username.toLowerCase();
    }

    if (user.services){
      var service = _.keys(user.services)[0];
      if (service == "google" || service=="facebook") {
        var email = user.services[service].email
        if (email) {
          email = email.toLowerCase();
          oldUser = Meteor.users.findOne({"emails.address": new RegExp(email,'i')});
          if (oldUser) {
            oldUser.services = oldUser.services || {};
            oldUser.services[service] = user.services[service];
            Meteor.users.remove(oldUser._id);
            user = oldUser;
          }
          else {
            if (user.services[service].email) {
              user.emails = [{address: user.services[service].email.toLowerCase(), verified: true}];
            }
            else {
              throw new Meteor.Error(500, "#{service} account has no email attached");
            }
            user.profile = user.profile || {};
            user.profile.name = user.services[service].name
          }
        }
      }
    }
    //default huddle (fixture) for new users, copied from 'new_huddle' method with hardcoded values..
    var huddle = {}
    huddle['name'] = 'Welcome to PushPlan';
    huddle.details = "Thanks for signing up! \nThis demo shows all the different features available on PushPlan, and also serves a way for you to talk to the developers! \n \n If you have any questions or comments, let us know in the chat or add ideas to the ideas poll!"
    huddle.date_time = new Date();
    huddle.date_time.setHours(19);
    huddle.created_by = user._id;
    //auto invite self to huddle
    var invite;
    invite = {
        created_at: new Date(), 
        invitee: user._id
    }
    invite2 = {
        created_at: new Date(), 
        invitee: 'GnQSNYftphf5bgmKD' //developer id
    }
    
    huddle.invites = [invite,invite2,];
    huddle.messages = [];
    huddle.participants = [];
    huddle.polls = [
        {type:'vote', name: 'ideas', desc:'Have any ideas on how to improve PushPlan? Add them here!', index:0}, 
    ];
    huddle.decision = [false,]
    huddle.tutorial = true; //auto-start app tutorial
    var huddle_id = Huddles.insert(huddle);
    var idea = {};
    idea.name = 'Nope, it\'s perfect!';
    idea.details = 'Like it just the way it is?';
    idea.date_time = new Date();
    idea.date_time.setHours(19);
    idea.huddle_id = huddle_id; 
    idea.created_by = user._id;
    idea.poll = 0;
    idea.votes = {};
    idea.score = 0;
    idea.created_at = new Date();
    Ideas.insert(idea);
    var idea2 = {};
    idea2.name = 'A mobile app';
    idea2.details = 'Wouldn\'t it be nice to have a mobile app? Bookmarking the site to your phone home screen is the best we can do for now...';
    idea2.date_time = new Date();
    idea2.date_time.setHours(19);
    idea2.huddle_id = huddle_id; 
    idea2.created_by = user._id;
    idea2.poll = 0;
    idea2.votes = {};
    idea2.score = 0;
    idea2.created_at = new Date();
    Ideas.insert(idea2);
    return user;
});

Accounts.emailTemplates.resetPassword = {
  subject: function(user) {
    return 'Password reset instructions for '+Meteor.absoluteUrl()//.replace("http:","https:")
  },
  text: function(user, url) {
    var token = url.substring(url.lastIndexOf('/') + 1)
    var s = "You've requested to have your password reset. Just click the link below to reset your password. \n ";
    s = s + Meteor.absoluteUrl() + "passwordReset/" + token; //.replace("http:","https:")
    return s;
  }
}

Accounts.emailTemplates.verifyEmail = {
  subject: function(user){
    return 'PushPlan Email Verification'
  },
  text: function(user, url){
    var token = url.substring(url.lastIndexOf('/') + 1)
    var s = displayName() +", \n Click the following link to verify your email \n ";
    s = s + Meteor.absoluteUrl() + "dashboard/verify/" + token; //.replace("http:","https:")
    return s;
  },
  html: function(user, url){
    var token = url.substring(url.lastIndexOf('/') + 1)
    var email_context = {
        link: Meteor.absoluteUrl()+ "dashboard/verify/" +token, //.replace("http:","https:")
        user: displayName()
        }
    return Handlebars.templates['verification_email'](email_context)
  }
}


Meteor.methods({
  migrate: function() { // utility function we use to update the database if necessary 
      var user = Meteor.user();
      if (admins.indexOf(user.username) == -1) { // pathetic security check
          return;
      }

      var pollDefault = [ {type:'vote', name: 'ideas', desc:'', index:0}, ];
      Huddles.update({},{$set:{polls:pollDefault, decision:[false,]}}, { multi: true });
      Ideas.update({}, {$set:{poll:0}}, { multi: true });

  },
  vote: function(idea_id, vote, all_bool){ //adds a vote 
      var userId = Meteor.userId();
      if (userId){
        var i = Ideas.findOne({_id:idea_id});
        // this makes vote toggling work. Need to be ignored if vote-all. 
        if  (i.votes[userId] == vote && !all_bool){ 
            i.votes[userId] = null;
        }else{
            i.votes[userId] = vote;
        }
        if(i.type == "rowing"){ //special rowing scoring
          var score = _.reduce(_.values(i.votes),function(memo,num){
            if (num > -2 && num !=null){
              return memo+1;
            }
            return memo;
          },0);
          var cox_score = _.reduce(_.values(i.votes),function(memo,num){
            if (num == -2){
              return memo+1;
            }
            return memo;
          },0);
          i.updated_at = new Date();
          Ideas.update({_id:idea_id}, {$set:{votes:i.votes, score:score, cox_score:cox_score, updated_at: new Date()}});
          Huddles.update({_id:i.huddle_id}, {$addToSet:{participants:userId}});
        }else{      //voting scoring
          var score = _.reduce(_.values(i.votes),function(memo,num){return memo+num},0);
          i.score = score;
          i.updated_at = new Date();
          //simulate server lag
          /*var Future = Npm.require('fibers/future');
          var future = new Future();
          Meteor.setTimeout(function() {
            future.return();
          }, 2* 1000); 
          future.wait();*/
          Ideas.update({_id:idea_id}, {$set:{votes:i.votes, score:i.score, updated_at: new Date()}});
          Huddles.update({_id:i.huddle_id}, {$addToSet:{participants:userId}});
        }
      }
  },
  userAddOauthCredentials: function(token, userId, service) {
    var updateSelector = "";
    if (service == "facebook"){
      data = Facebook.retrieveCredential(token).serviceData;
      updateSelector = 'services.facebook';
    }
    else if (service == "google") {
      data = Google.retrieveCredential(token).serviceData;
      updateSelector = 'services.google';
    }
    else {
      return false; // only support google and facebook right now
    }

    oldUser = Meteor.users.findOne({selector: data.id});
    if (oldUser) {
      throw new Meteor.Error(500, "This account has already" +
      "been assigned to another user.");
    }
    var update = {};
    update[updateSelector] = data;
    Meteor.users.update(userId, {$set: update});

    if (!(_.contains(Meteor.user().emails, data.email))) {
      Meteor.users.update(userId, {
        $push: {"emails": {address: data.email, verified: true}}, 
        $set:{'profile.name':data.name} 
      });
    }
  }, 
  verify: function(data) {
    var msg; 
    Regulate.verify_form.validate(data, function(error, data){
      if(error) {
      } else{
        var addr = data[0].value;
        var exists = Meteor.users.findOne({'emails.address':addr});
        if (exists && exists._id != Meteor.userId()) {
          throw new Meteor.Error(500, "This email has already" +
          "been assigned to another user.");
        } else if (exists){ //already 
          var verified; 
          for (var i=0; i<exists.emails.length;i++) {
            if (exists.emails[i].address == addr) {
              verified = exists.emails[i].verified;
            }
          }

          if (verified) {
            msg = "Your email address is already valid.";
          }
          else {
            msg = "Verification email sent"
          }
        } else {
          Meteor.users.update({_id: Meteor.userId()}, {$push: {'emails':{address: addr, verified:false}}});
          Accounts.sendVerificationEmail(Meteor.userId(), data[0].value);
          msg = "Verification email sent";
        }
      }
    });
    return msg;
  },
  erase_user: function(user_id) {
    //make sure they are unverified
    var u = Meteor.users.findOne({_id:user_id}); 
    var is_ver = verified(u);
    if (!u || is_ver) {
      return false;
    }
    // find all huddles they voted in 
    var huddles = Huddles.find({'invites.invitee':u._id}, {_id:1, invites:1}).fetch();
    //Huddles.update({'invites':{$elemMatch:{invitee:u._id}}},{$pull: {invites: {$elemMatch:{invitee:u.u_id}}}});
    Huddles.update({'invites':{$elemMatch:{invitee:u._id}}},
      {$pull: {invites:{invitee:u._id}, participants:u._id}}, 
      {multi:true}
    );
    Notify.remove({subject:u._id});
    
    for(var i=0;i<huddles.length;++i){
      var h = huddles[i]
      for(var j=0;j<h.invites.length;++j) {
        // Huddles.update({_id:h._id},
        //   {$pull: {invites: {$elemMatch:{invitee:u.u_id}}, participants:u._id}}
        // );
      }
      var array_of_idea_objects = Ideas.find({huddle_id:h._id}).fetch();
      
      _.each(array_of_idea_objects ,function(idea, index){ //loop over all ideas, delete votes from deleted user
        if (idea.type==="rowing"){
          var new_votes = _.omit(idea.votes, u._id);      
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
          var new_votes = _.omit(idea.votes, u._id);      
          var new_score = _.reduce(_.values(new_votes),function(memo,num){return memo+num},0);
            Ideas.update({_id:idea._id},{$set:{votes:new_votes, score:new_score}});
        }
      });
    }
    Meteor.users.remove({_id:u._id});
  },
  serviceActive: function(userId, service){
    user = Meteor.users.findOne({'_id':userId})
    if (user && user.services && user.services[service]) {
        return 'btn-success';
    }
    return 'btn-warning';
  }
});