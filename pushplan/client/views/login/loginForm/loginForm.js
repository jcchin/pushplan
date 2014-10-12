
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

Template.passwordResetForm.resetPassword = function() {
    return Session.get('resetPasswordToken');
};

Template.passwordResetForm.events = { //submit and clear input when pressing enter
    'keydown input#reset-request-email' : function (event) {
        if (event.which === 13) { // 13 is the enter key event
            //var name = 'User';
            var message  = document.getElementById('reset-request-email').value;
            if (message !== '') {
                //submit
                document.getElementById('request_reset_form').submit();
            }
            document.getElementById('reset-request-email').value = '';//reset input field
            message.value = '';
        }
    }
};

if (Accounts._resetPasswordToken) {
    Session.set('resetPasswordToken', Accounts._resetPasswordToken);
}

Template.loginForm.services = Template._loginButtonsLoggedOutAllServices.services;




