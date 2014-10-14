
/*****************************************************************************/
/* HuddleLayout: Event Handlers and Helpers .js*/
/*****************************************************************************/
Template.HuddleLayout.events = {

  'click .dropdown-menu li a': function(event){
      var pollType = event.target.getAttribute('data-type');
      Session.set('new-poll-type', pollType);
  },
  'click #slide-right': function() {
      Session.set('show-pane-right', false);
      var show = !Session.get('show-pane-left');
      Session.set('show-pane-left',show);
      reset_panes();
  },

  'click .edit-poll': function(event){
      var pollIndex = event.target.getAttribute('poll-index');
      var varName = 'edit_poll_'+pollIndex;
      var current = Session.get(varName);
      Session.set(varName, !current);
  },
  'click .edit-huddle': function(event){
      Session.set('editHuddleDetails',true);
  },
  'click .update-huddle': function(event){
      huddle_id = Session.get('huddle_id');
      newValue = document.getElementById("huddle-details").value;
      Huddles.update({_id: huddle_id}, {$set: {details:newValue}});
      Session.set('editHuddleDetails',false);
  },
  'click .cancel-edit-huddle': function(event){
      Session.set('editHuddleDetails',false);
  },
  'click .delete-poll': function(event) {
      var r = confirm("Pressing 'ok' will delete this poll and all of the associated votes");
      if (r){
          $('#chat-tab-nav').tab('show');
          var pollIndex = event.target.getAttribute('poll-index');
          var query = {};
          query['polls.'+pollIndex+'.active'] = false;
          Huddles.update({_id: Session.get('huddle_id')}, {$set:query});

      }
  },
  'click #invite': function(){
      Session.set("selected_idea", undefined);
  },
  'click .reopen': function(event){
      var pollIndex = $(event.target).attr('poll-index');
      Meteor.call('reopen',Session.get('huddle_id'), pollIndex);
  },
  'click #notify': function(){
      Meteor.call('notify', Session.get('huddle_id'));
  },
  'keydown #message' : function (event) {
      if (event.which === 13) { // 13 is the enter key event
          //var name = 'User';
          var message = {};
          message.string = document.getElementById('message1').value;

          if (message.string !== '') {
              Meteor.call('new_message', Session.get('huddle_id'), message);
          }

          document.getElementById('message1').value = '';//reset input field
          message.value = '';
          return false;
      }
  },
  'keyup input[name="username"]': function(event){
      Session.set('new-username', event.target.value);
  },
  'keyup input[name="password"]': function(event){
      Session.set('new-password', event.target.value);
  },
  'click .del-unverified-user': function() {
      var r = confirm("Pressing 'ok' will delete this user account and their votes. Users who verify their accounts on the dashboard cannot be deleted by other users.");
      if (r){
          var u_id;
          if (this._id) {
              u_id = this._id;
          } else {
              u_id = this.toString();
          }
          Meteor.call('erase_user', u_id);
      }

  }
};

Template.HuddleLayout.helpers({
  /*
   * Example:
   *  items: function () {
   *    return Items.find();
   *  }
   */
   selectedIdea: function () {
    // hack to get it to show time details panel 
    var pollIndex = Session.get('pollIndex');
    if(isNaN(pollIndex)){ //hide if new_poll_form
        return;
    } 
    var h = Huddles.findOne({_id:Session.get('huddle_id')});
    if(h && pollIndex ) {
        var poll = h.polls[pollIndex]; 
        if (pollIndex && poll && poll.type==="time") {
            return true;
        }
    }

    var idea = Ideas.findOne(Session.get("selected_idea"));
    if (idea) {
        if(idea.type=="rowing"){
            var lu_ids = _.keys(idea.votes);
            var p = Meteor.users.find({_id: {$in: lu_ids}}).fetch();
            idea.port_ppl = [];
            idea.both_ppl = [];
            idea.star_ppl = [];
            idea.cox_ppl = [];
            _.each(p, function(user){
                if (idea.votes[user._id] === 1){
                    idea.port_ppl.push({user: user, vote: idea.votes[user._id]});
                } else if (idea.votes[user._id] === 0){
                    idea.both_ppl.push({user: user, vote: idea.votes[user._id]});
                } else if (idea.votes[user._id] === -1){
                    idea.star_ppl.push({user: user, vote: idea.votes[user._id]});
                } else if (idea.votes[user._id] === -2){
                    idea.cox_ppl.push({user: user, vote: idea.votes[user._id]});
                }
            });
        }else{
            var lu_ids = _.keys(idea.votes);
            var p = Meteor.users.find({_id: {$in: lu_ids}}).fetch();
            idea.yes_ppl = [];
            idea.meh_ppl = [];
            idea.no_ppl = [];

            _.each(p, function(user){
                if (idea.votes[user._id] === 1){
                    //idea.yes_ppl.push({email: user.emails[0].address, vote: idea.votes[user._id]});
                    idea.yes_ppl.push({user: user, vote: idea.votes[user._id]});
                } else if (idea.votes[user._id] === 0){
                    //idea.meh_ppl.push({email: user.emails[0].address, vote: idea.votes[user._id]});
                    idea.meh_ppl.push({user: user, vote: idea.votes[user._id]});
                } else if (idea.votes[user._id] === -1){
                    //idea.no_ppl.push({email: user.emails[0].address, vote: idea.votes[user._id]});
                    idea.no_ppl.push({user: user, vote: idea.votes[user._id]});
                }
            });
        }
    }
    return idea;
  },
  isPollOpen: function (pollIndex) {
    var h = Huddles.findOne({_id:Session.get('huddle_id')});
    return !h.decision[pollIndex];
  },
  isPasswirdService: function(){
    return this.name === 'password';
  },
  huddle: function(){
    var h = Huddles.findOne({_id:Session.get('huddle_id')});
    if (h){
        //disable mouseover details on huddle tutorial
        if(h.hasOwnProperty('tutorial') && Session.get('tutorialEnabled')===undefined){
            Session.set('tutorialEnabled',true); //this variable disables mouseover
        }
        if(!h.hasOwnProperty('tutorial')){ //don't disable mouseover for any other huddles
            Session.set('tutorialEnabled',false);
        }
        //outstanding invites
        var other_user_ids = _.map(h.invites, function(invite){
            return invite.invitee;
        });
        // only users who have not voted yet
        other_user_ids = _.reject(other_user_ids, function(u_id){
            return _.contains(h.participants, u_id);
        });
        var users = Meteor.users.find({_id: {$in: other_user_ids}}).fetch();
        h.outstanding = users;

        h.active_polls = [];
        for(var i=0;i<h.polls.length;++i){
            if (h.polls[i].active !== false) {
                h.active_polls.push(h.polls[i]);
            }
        }

    }
    return h;
  },
  new_messages: function(){
    var userId = Meteor.userId();
    var n_chats = Notify.find( { huddle_id:Session.get('huddle_id'),
           type: "message",
           to:{$in:[userId]},
           seen:{$nin:[userId]}
        }).count();
    return n_chats;
  },
  new_ideas: function(pollIndex){
    var userId = Meteor.userId();
    var n_ideas = Notify.find( { huddle_id:Session.get('huddle_id'),
           type: "idea",
           subject: pollIndex, 
           to: {$in: [userId]},
           seen: {$nin: [userId]}
        }).count();
    return n_ideas;
  },
  huddle_url: function(){
    return Meteor.absoluteUrl().replace('http', 'https')+'huddles/'+Session.get('huddle_id');
  },
  enroll: function(){
    return Session.get('enrollPasswordToken');
  },
  editPoll: function(pollIndex){
    var varName = 'edit_poll_'+pollIndex;
    return Session.get(varName) ? true: false;
  },
  editHuddleDetails: function(){
    return Session.get('editHuddleDetails') ? true: false;
  },
  newPollType: function(type){
    var currentType = (Session.get('new-poll-type') || 'vote');
    if (isNaN(Session.get('pollIndex'))){   //don't test if not in the "new poll form" tab
        return type === currentType;
    } else{
        return false;
    }
  },
  isNewPollType: function(type){
    var newPollType = Session.get('new-poll-type');
    return newPollType === type || (newPollType === undefined && type==='vote')? 'active': '';
  },
  pollType: function(poll, type){
    return poll.type === type;
  },
});

//navigation helper functions
toggle_pane = function(side, open){
    var other_side = (side === "left" ? "right" : 'left');
    //var session_var = "show-pane-"+side;
    var dir = "window-go-" + other_side;
    var target = $('#phone-'+side);
    //var opposite_target = $('#phone-'+other_side);

    if (open) {
        //opposite_target.toggle();
        $('.window.window-center').addClass(dir);
        target.addClass(dir);
        if(window.innerWidth <767){
            target.css("overflow-y","scroll");
        }
    }else{
        //opposite_target.toggle();
        $('.window.window-center').removeClass('window-go-left window-go-right');
        target.removeClass(dir);
        if(window.innerWidth <767){
            target.css("overflow-y","hidden");
        }
    }
};

reset_panes = function() {
    // toggle_pane('right', false)
    // toggle_pane('left', false)

    if(Session.get('show-pane-right')) {
        toggle_pane('right', true);
    }else if(Session.get('show-pane-left')){
        toggle_pane('left', true);
    }
    else{
        toggle_pane('left', false);
        toggle_pane('right', false);
    }
};

Template.HuddleLayout.services = Template._loginButtonsLoggedOutAllServices.services;


/*****************************************************************************/
/* HuddleLayout: Lifecycle Hooks */
/*****************************************************************************/
Template.HuddleLayout.created = function () {
  Session.set('selected_idea', undefined);
  $.blockUI.defaults.css.border = '5px solid red';
  $.blockUI.defaults.css.top = '5%';
  var screenWidth = window.innerWidth;
  var pushLeft = screenWidth/2 - 148; //(center modal)
  $.blockUI.defaults.css.left = pushLeft;
  $.blockUI.defaults.css.display = 'block';
  $.blockUI.defaults.css.margin.left = 'auto';
  $.blockUI.defaults.css.margin.right = 'auto';
};

Template.HuddleLayout.rendered = function () {
  if (!Meteor.userId()){
      $.blockUI({ message: $('#huddle-login'), css: { width: '275px' } }); 
  }else{
      $.unblockUI();
  }
  
  reset_panes();

  //invite new users
  var h = Huddles.findOne({_id:Session.get('huddle_id')});
  var invited;
  if (h){
      for(var i=0;i<h.invites.length;++i){
          if (h.invites[i].invitee === Meteor.userId() && !h.invites[i].active){
              invited = true;
              break;
          }
      }
  }
  if (!invited && !Session.get('huddle-admin')) {
      Meteor.call('invite', Session.get('huddle_id'));
  }

  //make sure the correct tab is shown on reload
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      //save the latest tab; use cookies if you like 'em better:
      var target = $(e.target);
      var id = target.attr('id');
      var pollIndex = 0;
      if (id.indexOf('poll') >= 0) {
          pollIndex = target.attr('poll-index');
      }
      localStorage.setItem('lastTab', id);
      localStorage.setItem('pollIndex', pollIndex);
      Session.set('pollIndex', parseInt(pollIndex));
  });

  //go to the latest tab, if it exists:
  var lastTab = localStorage.getItem('lastTab');
  if(!Meteor.user()){ // not logged in so go to the chat
      $('#chat-tab-nav').tab('show');
  }else if (Session.get('new-poll-tab')) { //new poll created, so go to that one
      Session.set('new-poll-tab', undefined);
      var index = h.polls.length - 1;
      $('#poll-'+index+'-tab-nav').tab('show');
      Session.set('pollIndex', parseInt(index));
  }else if (lastTab) {
      if (lastTab === 'chat-tab-nav') {
          clear_notifications("message");
      } else if (lastTab.indexOf('poll')>=0) {
          var pollIndex = $("#"+lastTab).attr('poll-index');
          if(pollIndex) {
              clear_notifications("idea", parseInt(pollIndex));
              Session.set('pollIndex', parseInt(pollIndex));
          }
      }
      $('#'+lastTab).tab('show');
  }
  if(Session.get('form-errors') &&
      Session.get('form-errors')['invite-email'] &&
      Session.get('form-errors')['invite-email'][0] === 'Your invitation has been sent!') {
      $('.form-err-msg ').fadeOut(800, function(){
          $('.form-err-msg ').remove();
      });
  }

  //auto-scroll chat window to the bottom
  var chat = document.getElementById('chat-window');
  if(chat) { //not there if rendering the login form
      chat.scrollTop = chat.scrollHeight;
  }

  $('#sidebar').affix({ //http://bootply.com/94414#
      offset: {
          top: 120,
          bottom: 100
      }
  });

  $('#chat-tab-nav').on('shown.bs.tab', function(){
      //console.log("testing");
      clear_notifications('message');
  });

  $('.poll-tab-nav').on('shown.bs.tab', function(){
      var pollIndex = this.getAttribute('poll-index');
      clear_notifications('idea', parseInt(pollIndex));
  });

  clear_notifications('invite');

  var userId = Meteor.userId();
  var n_chats = Notify.find( { huddle_id:Session.get('huddle_id'),
         type: "message",
         to:{$in:[userId]},
         seen:{$nin:[userId]}
      }).count();
  var n_ideas = Notify.find( { huddle_id:Session.get('huddle_id'),
         type: "idea",
         to:{$in:[userId]},
         seen:{$nin:[userId]}
      }).count();
  var total = n_chats + n_ideas;
  var title;
  if (name && total>0){
      title = "(" + total.toString() + ") "+ h.name +"-PushPlan";
  }else if (h) {
      title = h.name+"-PushPlan";
  }else {
      title = "PushPlan";
  }
  document.title = title;
};

Template.HuddleLayout.destroyed = function () {
};


