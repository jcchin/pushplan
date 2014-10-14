
/*****************************************************************************/
/* ChatMessage: Event Handlers and Helpers .js*/
/*****************************************************************************/
Template.ChatMessage.checkAuthor = function(userID){
    if (userID === Meteor.userId()){
        return 'self';
    } else {
        return 'other';
    }
};

Template.ChatMessage.checkTime = function(time_submitted){
    return moment(time_submitted).fromNow();
};


/*****************************************************************************/
/* HuddleLayout: Lifecycle Hooks */
/*****************************************************************************/
Template.ChatMessage.created = function () {
};

Template.ChatMessage.rendered = function(){
  var chat_window = $('.discussion');
  if(window.innerWidth <767){
    chat_window.css("height","260px");
  }
}

Template.ChatMessage.destroyed = function () {
};
