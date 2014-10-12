Huddles = new Meteor.Collection('huddles');
Huddles.allow({
    insert: function(userId, doc) {
        return true;
    },
    update: function(userId, doc) {
        return true;
    },
    remove: function(userId, doc) {
        return false;
    },
});

Ideas = new Meteor.Collection('ideas');
Ideas.allow({
    insert: function(userId, doc) {
        return true;
    },
    update: function(userId, doc) {
        return true;
    },
    remove: function(userId, doc) {
        return true;
    },
});

Notify = new Meteor.Collection('notify'); 
Notify.allow({
    insert: function(userId, doc) {
        return true;
    },
    update: function(userId, doc) {
        return true;
    },
    remove: function(userId, doc) {
        return false;
    },
});