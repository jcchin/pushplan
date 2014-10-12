Array.prototype.extend = function (other_array) {
    /* you should include a test to check whether other_array really is an array */
    other_array.forEach(function(v) {this.push(v)}, this);    
};

set_form_errors = function(error) {
    console.log('Form validation failed. These are the errors: ', error);
    var form_errors = {}
    _.each(error, function(errs, key, list){
        form_errors[key] = errs;
    });
    Session.set('form-errors', form_errors);
};

reset_form_errors = function(error) {
    Session.set('form-errors', undefined);
};

addUserService = function(service) {
    if (service == "facebook") {
        var options = {
            requestPermissions: ["email", ],
        };
        Facebook.requestCredential(options, function(token) {
            Meteor.call("userAddOauthCredentials", token, Meteor.userId(), service, function(err, resp){
                console.log(err);
            });
        });
    }
    else if(service == "google") {
        var options = {
            requestPermissions: ["email", ],
            requestOfflineToken: true, 
        };
        Google.requestCredential(options, function(token) {
            Meteor.call("userAddOauthCredentials", token, Meteor.userId(), service, function(err, resp){
                console.log(err);
            });
        });
    }
};

clear_notifications = function(type, pollIndex) {
    var query = {huddle_id: Session.get('huddle_id'), type:type};
    if(pollIndex !== undefined) {
        query.subject = pollIndex;
    }
    var notifies = Notify.find(query).fetch();

    for (var i=0; i<notifies.length; ++i){
        Notify.update({_id:notifies[i]._id}, {$addToSet:{seen:Meteor.userId()}});
    }
};

verified = function(user){
    if (!user || typeof(user.hash)=='object') {
        user = Meteor.user(); 
    }else if (typeof(user) == "string"){
        user = Meteor.users.findOne({_id:user});
    }
   
    if (user && user.emails) {
        for (var i=0; i<user.emails.length; ++i){
            if (user.emails[i].verified){
                return true;
            }
        }
    }
    return false; 
};

displayName = function(user) {
    if (typeof(user) == "string") {
        user = Meteor.users.findOne({_id:user});
    }
    if (!user) {
        var user = Meteor.user();
    }
    if (!user) {
        return ''
    }
    if (user.profile && user.profile.name) {
        return user.profile.name;
    }
    if (user.username) {
        return user.username;
    }
    return '';
};

removeClass = function(el, cn){
    el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
};

trim = function(str){
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g,'');
};

addClass = function(el, cn){
    if (!hasClass(el, cn)) {
        el.className = (el.className === '') ? cn : el.className + ' ' + cn;
    }
};

hasClass = function(el, cn){
    return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
};

getViewPortSize = function(){
    var viewportwidth;
    var viewportheight;

    //Standards compliant browsers (mozilla/netscape/opera/IE7)
    if (typeof window.innerWidth != 'undefined')
    {
        viewportwidth = window.innerWidth,
        viewportheight = window.innerHeight
    }

    // IE6
    else if (typeof document.documentElement != 'undefined'
    && typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0)
    {
        viewportwidth = document.documentElement.clientWidth,
        viewportheight = document.documentElement.clientHeight
    }

    //Older IE
    else
    {
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
        viewportheight = document.getElementsByTagName('body')[0].clientHeight
    }

    return {width:viewportwidth, height:viewportheight};
};

cmMaker = function(high,low) { //return color from white to green, Jeff's first closure

    //var start_color = 0, 0, 0
    //var end_color = 92, 184, 92 //bootstrap success green
    var r_max = 92;
    var g_max = 184;
    var b_max = 92;

    r_b = (255 - r_max*(low/high))/(1-(low/high));
    r_a = (r_max-r_b)/high;
    g_b = (255 - g_max*(low/high))/(1-(low/high))
    g_a = (g_max-g_b)/high
    b_b = (255 - b_max*(low/high))/(1-(low/high))
    b_a = (b_max-b_b)/high

    return function(x) {
        var r = Math.floor((r_a*x)+r_b);
        var g = Math.floor((g_a*x)+g_b);
        var b = Math.floor((b_a*x)+b_b);
        return 'rgb('+ (r) +', ' + (g) + ', ' + (b) + ')';
    }
}