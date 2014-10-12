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