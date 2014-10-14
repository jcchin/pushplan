/*****************************************************************************/
/* admin: Event Handlers and Helpers .js*/
/*****************************************************************************/
Template.admin.huddles = function(){
    var huddles =  Huddles.find({}, { sort: { date_time: -1 }}).fetch();

    var counts = {};
    _.each(huddles, function(huddle){
        var n_ideas = Ideas.find({huddle_id:huddle._id}).count();
        var n_chats = huddle.messages.length;
        var n_users = huddle.participants.length;

        counts[huddle._id] = {ideas: n_ideas, chats:n_chats, users:n_users};
    });
    Session.set('huddle_stats', counts);
    return huddles;
};

Template.admin.huddle_stats = function(huddle_id, type){
    return Session.get('huddle_stats')[huddle_id][type];
};

Template.admin.user_count = function() {
    return Meteor.users.find().count();
};

Template.admin.events = {
    'click .huddle-row .clickable': function() {
        Router.go('admin/huddles/'+this._id);
    },
};


/*****************************************************************************/
/* admin: Lifecycle Hooks */
/*****************************************************************************/

Template.admin.created = function () {

};

Template.admin.rendered = function() {

    var user_counts={};
    var huddles = Huddles.find().fetch();

    var ideas_count = {};
    var participants_count = {};
    var invites_count = {};
    var user_ids = [];

    for(var i=0; i<huddles.length; ++i) {
        var h = huddles[i];
        var ideas = Ideas.find({huddle_id:h._id}).fetch();
        var n_ideas = 0;
        for (var j=0; j<ideas.length; ++j) {
            n_ideas += 1;
            user_ids.extend(_.keys(ideas[j].votes));
        }
        var participants = _.uniq(user_ids);
        var n_participants = participants.length;
        // var invitees = _.filter(h.invites, function(invite){
        //     return invite.active == false;
        // });
        var n_invites = h.invites.length;

        //particpant counts 
        if (participants_count[n_participants]) {
            participants_count[n_participants] += 1;
        }
        else {
            participants_count[n_participants] = 1;
        }

        //invites count 
        if (invites_count[n_invites]) {
            invites_count[n_invites] += 1;
        }
        else {
            invites_count[n_invites] = 1;
        }

        //idea counts
        if(ideas_count[n_ideas]) {
            ideas_count[n_ideas] += 1;
        }
        else {
            ideas_count[n_ideas] = 1;
        }

        //user counts
        if(user_counts[h.created_by]) {
            user_counts[h.created_by] += 1;
        }
        else {
            user_counts[h.created_by] = 1;
        }
    }
    var counts = _.countBy(_.values(user_counts), function(num){return num;});
    var huddled_created_data = _.pairs(counts);
    var options = {
        xaxis : {
            ticks: _.keys(counts),
        }
    };

    $.plot($("#huddlecount_chart"), [ huddled_created_data ], options);

    options = {
        xaxis: {
            ticks: _.keys(ideas_count),
        }
    };
    $.plot($("#ideacount_chart"), [_.pairs(ideas_count)], options);

    // var options = {
    //     xaxis: {
    //         ticks: _.union(_.keys(participants_count), _.keys(invites_count)),
    //     },
    //     series: {
    //         lines: { show: true, fill: true},
    //     }
    // }
    // $.plot($("#peoplecount_chart"), [{ label: "Partic.", data:_.pairs(participants_count)}, 
    //                                  { label: "Invites", data:_.pairs(invites_count)}
    //                                  ], 
    //                               options);


    $(function() {

        //for bootstrap 3 use 'shown.bs.tab' instead of 'shown' in the next line
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            //save the latest tab; use cookies if you like 'em better:
            localStorage.setItem('lastTab', $(e.target).attr('id'));
        });

        //go to the latest tab, if it exists:
        var lastTab = localStorage.getItem('lastTab');
        if (lastTab) {
            $('#'+lastTab).tab('show');
        }
    });

};

Template.admin.destroyed = function () {

};


