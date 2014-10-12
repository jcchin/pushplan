
Template.loginForm.events = {
    'click #register' : function() {
        Session.set('register-new-user', true);
    },
};



Template.loginForm.is_new = function() {
    return Session.get('register-new-user') ? true : false;
};

Template.loginForm.submit_text = function(){
    return Session.get('register-new-user') ? 'Sign Up' : 'Log In';
};

Template.loginForm.isPasswordService = function () {
    return this.name === 'password';
};

Template.loginForm.rendered = function(){
    Session.set('on_login', true);

    if (Meteor.user()){
        Router.go("/");
    }
};

Template.loginForm.destroyed = function(){
    Session.set('on_login', false);
    Session.set('register-new-user', false);
};


Template.logout.rendered = function(){
    Meteor.logout(function(err){
        if (err) {
            Meteor._debug(err);
        }
        else{
            Router.go("/");
        }
    });
};



Template.loginForm.services = Template._loginButtonsLoggedOutAllServices.services;




