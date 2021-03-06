ServiceConfiguration.configurations.remove({
  service: "facebook"
});
ServiceConfiguration.configurations.insert({
  service: "facebook",
  appId: Meteor.settings.facebookClientID,
  secret: Meteor.settings.facebookSecret
});


ServiceConfiguration.configurations.remove({
  service: "google"
});
ServiceConfiguration.configurations.insert({
  service: "google",
  clientId: Meteor.settings.googleClientID,
  secret: Meteor.settings.googleSecret
});

if(Meteor.settings.MAIL_URL !== undefined){
    process.env.MAIL_URL = Meteor.settings.MAIL_URL;
}