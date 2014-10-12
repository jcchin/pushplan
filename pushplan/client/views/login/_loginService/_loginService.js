Template._loginService.events = {
    'click': function () {
        var serviceName = this.name;
        //Session.resetMessages();
        var callback = function (err) {
            var huddle_id = Session.get('huddle_id');
            console.log("error in service callback: ", err);
            if (!err && huddle_id) { //if they log in through g+ or facebook from a huddle.
                Router.go("/huddles/"+huddle_id); 
            }else{
                Router.go("/");
            }
        };

        var loginWithService = Meteor["loginWith" + capitalize(serviceName)];

        var options = {}; // use default scope unless specified
        if (Accounts.ui._options.requestPermissions[serviceName]) {
            options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
        }
        if (Accounts.ui._options.requestOfflineToken[serviceName]) {
            options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
        }
        loginWithService(options, callback);
    }
};

//
// helpers
//

var capitalize = function(str){
    str = str === null ? '' : String(str);
    return str.charAt(0).toUpperCase() + str.slice(1);
};