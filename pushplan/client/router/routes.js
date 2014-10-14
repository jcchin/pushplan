//Client Side Routes
Router.route('splash', {
    path: '/',
    waitOn: function() {
        Meteor.subscribe('directory');
        return;
    },
    onBeforeAction: function(){
        if (Meteor.user()) {
            this.redirect('/dashboard');
        }
    }
});
Router.route('loginForm', {
    path: "/login"
});
Router.route('dashboard',{
    path: "/dashboard",
    layoutTemplate: 'DashboardLayout',
    loadingTemplate: 'loading',
    waitOn: function() {
        return Meteor.subscribe("huddles");
    },
    onBeforeAction: function() {
        if (!Meteor.user()) {
            this.redirect('/');
        }
    },
    action: function(){
        this.render('dash', {to:'dash'});
    }
});
Router.route('dashboard',{
    path: "/dashboard/verify/:token",
    loadingTemplate: 'loading',
    waitOn: function() {
        return Meteor.subscribe("huddles");
    },
    onBeforeAction: function() {
        var token = this.params.token;
        Accounts.verifyEmail(token, function(){
            Router.go('/dashboard');
        });
    }
});
Router.route('passwordResetForm', {
    path:"/passwordReset/:token",
    data: function(){
        var token = this.params.token;
        Session.set('resetPasswordToken',token);
    }
});
Router.route('passwordResetForm', {
    path:"/passwordReset",
});
Router.route('logout', {
    path: "/logout"
});
Router.route('huddle',{
    path: "/huddles/:huddle_id",
    loadingTemplate: 'loading2',
    waitOn: function() {
        Meteor.subscribe("ideas", Session.get('huddle_id'));
        Meteor.subscribe("huddle", Session.get('huddle_id'));
        Meteor.subscribe('directory');
        var huddle_id = this.params.huddle_id;
        Session.set('huddle_id', huddle_id);
        return;
    },
    onBeforeAction: function(){
        var huddle_id = this.params.huddle_id;
        Session.set('huddle_id', huddle_id);
        Session.set('enrollPasswordToken', undefined); //hack to clear the token
        Session.set('huddle-admin', undefined); // hack to clear the token
    }
});
Router.route('huddle_enroll',{
    path: "/huddles/:huddle_id/enroll/:token",
    loadingTemplate: 'loading',
    waitOn: function() {
        Meteor.subscribe("ideas", Session.get('huddle_id'), Session.get('pollIndex'));
        Meteor.subscribe("huddle", Session.get('huddle_id'));
        Meteor.subscribe('directory');
        return;
    },
    onBeforeAction: function(){
        var huddle_id = this.params.huddle_id;
        Session.set('huddle_id', huddle_id);

        var token = this.params.token;
        Session.set('enrollPasswordToken',token);
    },
    template:'huddle'
});
// admin routes
Router.route('admin_dashboard', {
    path:'/admin',
    loadingTemplate: 'loading',
    waitOn: function() {
        return Meteor.subscribe("huddles", true);
    },
    onBeforeAction: function() {
        Session.set('huddle-admin', true);
    }
});
Router.route('admin_huddle', {
    path:'/admin/huddles/:huddle_id',
    loadingTemplate: 'loading',
    waitOn: function() {
        Meteor.subscribe("ideas", Session.get('huddle_id'), Session.get('pollIndex'));
        Meteor.subscribe("huddle", Session.get('huddle_id'));
        Meteor.subscribe('directory');
        return;
    },
    onBeforeAction: function(){
        var huddle_id = this.params.huddle_id;
        Session.set('huddle_id', huddle_id);
        Session.set('huddle-admin', true);
    },
    template: 'huddle'
});
Router.route('mobile', {
    path:'/mobile'
});

Meteor.startup(function () {
    Regulate.invite_form.onSubmit(function (error, data) {
        Session.set('form-errors',{});
        if (error) {
            set_form_errors(error);
        } else {
            console.log('Validation passed. This is the data: ', data);
            // Send the data over to the server via an exposed Meteor method:
            Meteor.call('invite', Session.get('huddle_id'), data);
            
            var form_errors = {'invite-email': ['Your invitation has been sent!']};
            Session.set('form-errors', form_errors);
            document.getElementById('invite_form').reset();
            console.log($('#invite-success-msg'));
        }
    });

    Regulate.login_form.onSubmit(function(error, data){
        Session.set('form-errors',{});
        if (error){
            set_form_errors(error);
        } else {
            console.log('login form validation passed. This is the data: ', data);
            var username = data[0].value.toLowerCase();
            var password = data[1].value;

            if (Session.get('register-new-user')) {
                Accounts.createUser({username: username, password: password}, function(err){
                    if (err) {
                        var form_errors = {};
                        console.log('reg error: ', err);
                        if (err.reason === "Email already exists.") {
                            form_errors.password = ['A user with that email already exists!'];
                        }
                        else {
                            form_errors.password = [err.reason];
                        }
                        Session.set('form-errors', form_errors);
                    } else {
                        Router.go('/');
                    }
                });
            }
            else { //do a login
                Meteor.loginWithPassword({'username':username}, password, function(err){
                    if (err) {
                        var form_errors = {};
                        if (err.reason==="User not found" || err.reason==="Incorrect password"){
                            form_errors.password = ["Invalid email or password",];
                        }
                        else {
                            form_errors.password = [err.reason];
                        }
                        Session.set('form-errors', form_errors);
                    }
                    else {
                        Router.go('/');
                    }
                });
            }
        }
    });

    Regulate.request_reset_form.onSubmit(function(error,data){
        Session.set('form-errors',{});
        if (error) {
            set_form_errors(error);
        } else{
            console.log('login form validation passed. This is the data: ', data);
            var email_addr = data[0].value;
    
            Accounts.forgotPassword({email: email_addr.toLowerCase()}, function(err){
                if (err) {
                    var form_errors = {};
                    //Session.set('displayMessage', 'Password Reset Error &amp; Doh');
                    form_errors['reset-request-email'] = ['Password Reset Error -- Doh'];
                    Session.set('form-errors', form_errors);
                } else {
                    Router.go('/passwordReset');
                }
            });
        }
        document.getElementById('reset-request-email').value = '';
    });

    Regulate.new_password_form.onSubmit(function(error, data){
        Session.set('form-errors', {});
        if (error){
            set_form_errors(error);
        }else{
            var new_password = data[0].value;
            //console.log(new_password);
            Accounts.resetPassword(Session.get('resetPasswordToken'), new_password,
                function(){
                    Router.go("/");
                }
            );
        }
    });


    Regulate['#sign_up_form'].onSubmit(function(error, data) {
        var username;
        var password;
        if(error) {
            //allow people to login from splash form
            if (error.username && error.username[0] === "username is taken! choose another name or enter the correct password") {
                //have to grab the value directly, because data arg is empty when there is an error

                username = $('#sign_up_form input[type="text"]').val().toLowerCase();
                password = $('#sign_up_form input[type="password"]').val();
                Meteor.loginWithPassword({'username':username}, password, function(err){
                    if (err) {
                        set_form_errors(error);
                    }
                });
            }
            else {
                set_form_errors(error);
            }
        }
        else {
            username = data[0].value;
            password = data[1].value;
            Accounts.createUser({username:username, password: password});
        }
    });

    Regulate['.add_new_poll'].onSubmit(function(error, data) {
        var name, details;
        //console.log(error, data)
        if(error) {
            set_form_errors(error);
        }else{
            name = data[0].value;
            details = data[1].value;
            reset_form_errors();

            //have to grab the optional description value because regulate.js does not have optional inputs
            var desc = $('form.add_new_poll').find('textarea[name=desc]').val();
            $('.add_new_poll')[0].reset();

            var poll = {
                type:"vote",
                name: name,
                desc: details,
            };
            Meteor.call('new_poll', Session.get('huddle_id'), poll);
            Session.set('new-poll-tab', true);

        }
    });
    
    Regulate['.add_new_rowing_poll'].onSubmit(function(error, data) {
        var name, details;
        //console.log(error, data)
        if(error) {
            set_form_errors(error);
        }else{
            name = data[0].value;
            details = data[1].value;
            reset_form_errors();

            //have to grab the optional description value because regulate.js does not have optional inputs
            var desc = $('form.add_new_rowing_poll').find('textarea[name=desc]').val();
            $('.add_new_rowing_poll')[0].reset();

            var poll = {
                type:"rowing",
                name: name,
                desc: details,
            };
            Meteor.call('new_poll', Session.get('huddle_id'), poll);
            Session.set('new-poll-tab', true);
        }
    });

    Regulate['.edit-poll'].onSubmit(function(error, data) {
        var name, pollIndex;
        if(error) {
            set_form_errors(error);
        }else{
            reset_form_errors();
            name = data[0].value;
            pollIndex = data[1].value;

            //have to grab the optional description value because regulate.js does not have optional inputs
            var desc = $('form.edit-poll[poll-index='+pollIndex+']').find('textarea[name=desc]').val();

            query = {};
            var poll = 'polls.'+pollIndex+".";
            query[poll+"name"] = name;
            query[poll+"desc"] = desc;
            Huddles.update({_id:Session.get('huddle_id')}, {$set:query});
            var varName = 'edit_poll_'+pollIndex;
            var current = Session.get(varName);
            Session.set(varName, !current);
        }
    });

});



UI.registerHelper('isNotLogin', function() {
    if (Meteor.user()) {
        return false;
    }
    return true;
});

UI.registerHelper(
    "formErrors",
    function () {
        var field_name = this.email;
        var errs = Session.get('form-errors');
        var errors = "";
        if (errs){
            var msgs = errs[field_name];
            _.each(msgs, function(m){
                errors = errors + '<li class="form-err-msg">'+m+'</li>';
            });
        }
        return errors;
    }
);

UI.registerHelper(
    "formErrorClass",
    function (field_name) {
        var errs = Session.get('form-errors');
        if (errs && errs[field_name]){
            return 'has-error';
        }
        return '';
    }
);

UI.registerHelper(
    'valid_user_name',
    function(){
        var new_name = Session.get('new-username');
        if(new_name && new_name.length >= 4){
            //console.log(Meteor.users.findOne({username:new_name}));
            var check_user = Meteor.users.findOne({username:new_name.toLowerCase()});
            if (check_user===undefined || (Meteor.user() && Meteor.user().username===new_name)) {
                return 'has-success';
            }
            return 'has-error';
        }
        else if (new_name === undefined) {
            return '';
        }
        return 'has-error';
    }
);

UI.registerHelper(
    'valid_password',
    function(){
        var password = Session.get('new-password');
        if(!password){
            return '';
        }
        if(password && password.length >= 4){
            //console.log(Meteor.users.findOne({username:new_name}));
            return 'has-success';
        }
        return 'has-error';
    }
);


UI.registerHelper( //this has to be done on the server..should be refactored.
    'serviceActive',
    function(service){
        var user = Meteor.user()._id;
        Meteor.call('serviceActive',user,service, function(error,result){
            if(service=='facebook'){
                Session.set('fb', result);
            }
            if(service=='google'){
                Session.set('google', result);
            }
        });
        if(service=='facebook'){
            return Session.get('fb');
        }
        if(service=='google'){
            return Session.get('google');
        }
    }
);

UI.registerHelper(
    'verified',
    function( user_id ){
        return verified( user_id );
    }
);

UI.registerHelper(
    'displayName',
    function( user ){
        return displayName( user );
    }
);

UI.registerHelper(
    'linkify',
    function(text){
        if(text){
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            return new Handlebars.SafeString(text.replace(exp,"<a href='$1' target=\"_blank\">$1</a>"));
        }
    }
);

UI.registerHelper('sm', function(){
    var size = getViewPortSize();
    if (size.width < 990){
        return true;
    }
    return false;
});
