/*****************************************************************************/
/* Tutorial: Event Handlers and Helpers .js*/
/*****************************************************************************/
//separate tutorial for desktop vs mobile

//Desktop -------------------------------------------------
Template.huddle.helpers({
    tutorialEnabled: function(){
        hud = Huddles.findOne({'_id':Session.get('huddle_id')})
        enab = Session.get('tutorialEnabled')
        if (Meteor.user() && hud && hud.hasOwnProperty('tutorial') && enab){
            return hud.tutorial;
        }
      return false;
    }
});

var huddleTutorialSteps = [
    {
      template: Template.tutorial_step0,
      onLoad: function(){
        setTimeout(function(){
          var ideas = Ideas.find({huddle_id:Session.get('huddle_id')}).fetch()
          //console.log(Session.get('huddle_id'))
          if(ideas[1].score>-1){
            Meteor.call('vote',ideas[0]._id, -1)
            Meteor.call('vote',ideas[1]._id, -1)
          }
        },10); //hack, seems to need a moment to pull up huddle_id
      }
    },
    {
      template: Template.tutorial_step1,
      spot: "#step1",
      onLoad: function(){
        
      }
    },
    {
      template: Template.tutorial_step2,
      spot: "#step2",
      onLoad: function(){
        
      }
    },
    {
      template: Template.tutorial_step3,
      spot: "#step3",
      onLoad: function(){
        $('#poll-0-tab-nav').click();
      }
    },
    {
      template: Template.tutorial_step4,
      spot: "#step3",
      onLoad: function(){
        var ideas = Ideas.find({huddle_id:Session.get('huddle_id')}).fetch()
        if(ideas[1].score<0){
          Meteor.call('vote',ideas[1]._id, 1)
        }
      }
    },
    {
      template: Template.tutorial_step5,
      spot: "#step5",
      onLoad: function(){
      }
    },
    {
      template: Template.tutorial_step6,
      spot: "#step2",
      onLoad: function(){
      
      }
    }
];

Template.huddle.options = {
    steps: huddleTutorialSteps,
    onFinish: function(){
        Session.set('tutorialEnabled', false)
    }
}





// Mobile -------------------------------------------------
var huddleTutorialStepsMobile = [
    {
      template: Template.tutorial_step0m,
      onLoad: function() { 
        setTimeout(function(){
          var ideas = Ideas.find({huddle_id:Session.get('huddle_id')}).fetch()
          //console.log(Session.get('huddle_id'))
          if(ideas[1].score>-1){
            Meteor.call('vote',ideas[1]._id, -1)
          }
        },10); //hack, seems to need a moment to pull up huddle_id
      }//console.log("The tutorial has started!"); 
    },
    {
      template: Template.tutorial_step1m,
      spot: "#step1m",
      onLoad: function() { 
      }//console.log("The tutorial has started!"); 
    },
    {
      template: Template.tutorial_step2m,
      spot: "#step2"
    },
    {
      template: Template.tutorial_step3m,
      spot: "#step3",
      onLoad: function(){
        $('#poll-0-tab-nav').click();
      }
    },
    {
      template: Template.tutorial_step4m,
      spot: "#step3",
      onLoad: function(){
        var ideas = Ideas.find({huddle_id:Session.get('huddle_id')}).fetch()
        if(ideas[1].score<0){
          Meteor.call('vote',ideas[1]._id, 1)
        }
      }
    },
    {
      template: Template.tutorial_step5m,
      onLoad: function(){
        
      }
    },
];

Template.huddle.optionsMobile = {
    steps: huddleTutorialStepsMobile,
    onFinish: function(){
        Session.set('tutorialEnabled', false)
    }
}

/*****************************************************************************/
/* Tutorial: Lifecycle Hooks */
/*****************************************************************************/
/*
Template.Tutorial.created = function () {

};

Template.Tutorial.rendered = function () {

};

Template.Tutorial.destroyed = function () {

};

*/
