
/*****************************************************************************/
/* Splash: Event Handlers and Helpers .js*/
/*****************************************************************************/
Template.splash.events({
  'keyup input[name="username"]': function(event){
    Session.set('new-username', event.target.value);
  },
  'keyup input[name="password"]': function(event){
    Session.set('new-password', event.target.value);
  },
});

Template.splash.helpers({

  isPasswordService: function () {
    return this.name === 'password';
  }
  
});


Template.splash.services = Template._loginButtonsLoggedOutAllServices.services;

Accounts.ui.config({
  requestPermissions: {
    facebook: ['user_likes'],
    github: ['user', 'repo']
  },
  requestOfflineToken: {
    google: true
  },
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});

/*****************************************************************************/
/* Splash: Lifecycle Hooks */
/*****************************************************************************/

Template.splash.created = function () {
  Session.set('new-username', undefined);
  Session.set('form-errors', undefined);
  Session.set('new-password', undefined);
    document.title = "PushPlan";
};

Template.splash.rendered = function () {
  $(window).scroll( function(){
      /* Check the location of each desired element */
      $('.hideme').each( function(i){
          var bottom_of_object = $(this).position().top + $(this).outerHeight();
          var bottom_of_window = $(window).scrollTop() + $(window).height();
          /* If the object is completely visible in the window, fade it it */
          if( bottom_of_window > bottom_of_object ){
              
              $(this).animate({'opacity':'1'},1000);
                  
          }
      });
  
  });
};

Template.splash.destroyed = function () {
  Session.set('new-username', undefined);
  Session.set('form-errors', undefined);
  Session.set('new-password', undefined);
};


