Regulate('invite_form', [
    {
       name:'invite-email', 
       email: true,
    }
]);

Regulate('request_reset_form',[
    {
        name:'reset-request-email', 
        email: true,
    }
]);

Regulate('new_password_form',[
    {
        name:'new-password', 
        min_length:4
    },
    {
        name:'confirm-new-password',
        match_field: 'new-password',

    }
]);

Regulate('enroll_new_user_form',[
    {
        name:'new-password', 
        min_length:4
    },
    {
        name:'confirm-new-password',
        match_field: 'new-password',

    }
]);

Regulate('account_info_form', [
    {
        name: 'username', 
        min_length: 4, 
        name_avail: true, 
    }
]);

Regulate('change_password_form', [
    {
        name: 'old-password', 
    },
    {
        name: 'new-password', 
        min_length: 4,
    },
    {
        name: 'confirm-new-password', 
        match_field: 'new-password',
        error: {
            match_field: "Passwords do not match.",
        }
    },
]);

Regulate('verify_form', [
    {
        name: 'user-email', 
        email:true, 
        error: {
            required: 'email address is required', 
            email: 'Invalid email address'
        }
    },
]);

/*Regulate('#date_time_range',[
    {
        name:'start_date',
    },
    {
        name:'end_date',
    },
    {
        name:'start_time',
    },
    {
        name:'end_time',
    }

    ])*/


Regulate.registerRule('name_avail', function (fieldValue, fieldReqs, fields) {
  fieldValue = fieldValue.toLowerCase();
  var isUnique = Meteor.users.findOne({username:fieldValue});
  var current_user = Meteor.user();
  if (current_user && current_user.username==fieldValue) {
    return true;
  }
  return (isUnique==undefined); // true or false.
});

Regulate.registerMessage('name_avail', function (fieldName, fieldReqs) {
  return fieldName + " is taken! choose another name or enter the correct password";
});


Regulate('#sign_up_form', [
    {
        name: 'username', 
        min_length: 4, 
        name_avail: true,
    },
    {
        name: 'password', 
        min_length: 4,
    }
]);



Regulate.registerRule('name_valid', function (fieldValue, fieldReqs, fields) {
  var isUnique = Meteor.users.findOne({username:fieldValue});
  return (isUnique!=undefined); // true or false.
});

Regulate.registerMessage('name_valid', function (fieldName, fieldReqs) {
  return "No such user exists";
});


Regulate('login_form', [
    {
        name: 'username', 
        min_length: 4, 
        name_valid: true, 
    },
    {
        name: 'password', 
        min_length: 4,        
    }
]);

Regulate('.add_new_poll', [
    {
        name:'poll-name', 
        max_length: 6,
        error:{
            max_length: "The poll name cannot be longer than 6 characters.",
        } 
    }
]);

Regulate('.add_new_rowing_poll', [
    {
        name:'poll-name', 
        max_length: 6,
        error:{
            max_length: "The poll name cannot be longer than 6 characters.",
        } 
    }
]); 

Regulate('.edit-poll', [
    {
        name:'poll-name', 
        max_length: 6,
        error:{
            max_length: "The poll name cannot be longer than 6 characters.",
        } 
    },
    {
        name:'index'
    }

]); 



