/*****************************************************************************/
/* Mobile Event Handlers and Helpers .js*/
/*****************************************************************************/
Template.mobile.events = {

  'click #androidNotify': function(){
    var inpt = $('#androidNotifyInput input[type="email"]');
    var email = inpt.val();
    Meteor.call('mobileNotify', 'android', email, Meteor.user());
    inpt.val("");
  },
  'click #iphoneNotify': function(){
    var inpt = $('#iphoneNotifyInput input[type="email"]');
    var email = inpt.val();
    Meteor.call('mobileNotify', 'iphone', email, Meteor.user());
    inpt.val("");
  },
  'click #windowsNotify': function(){
    var inpt = $('#windowsNotifyInput input[type="email"]');
    var email = inpt.val();
    Meteor.call('mobileNotify', 'iphone', email, Meteor.user());
    inpt.val("");
  }
}

/*****************************************************************************/
/* Mobile: Lifecycle Hooks */
/*****************************************************************************/

Template.dash.created = function () {

};

Template.dash.rendered = function () {

};

Template.dash.destroyed = function () {

};


