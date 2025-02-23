// Detect the Input Entry Activity / Event
document.addEventListener('DOMContentLoaded', ()=> {

    const forgot_form = document.getElementById('forgot_form');

    // Detect Form Submission Activity / Event
    forgot_form.addEventListener('submit', function(event) {

        // Dynamically Modify Page after form submission
        const confirm_msg = document.createElement('p');
        confirm_msg.style.color = 'green';
        confirm_msg.textContent = 'We have sent the Account Password Reset Link to your Email. Click the link in the Email to Reset your password.'
        forgot_form.parentNode.appendChild(confirm_msg);
        forgot_form.style.display = 'none'; // Hide the Form after Submission

    });
});

