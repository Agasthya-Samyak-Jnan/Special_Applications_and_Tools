// Detect the Input Entry Activity / Event
document.addEventListener('DOMContentLoaded', ()=> {

    const reset_form = document.getElementById('reset_form');
    const pass = document.getElementById('password');
    let accept_pass = false;

    // Create the 'p' element for password strength message
    const strength_message = document.createElement('p'); 
    strength_message.style.marginTop = '10px'; 
    strength_message.style.color = 'red'; // Default color for weak password
    // Append the 'p' element to the DOM (just after the password input field)
    pass.parentNode.appendChild(strength_message);

    const pass_rules = document.createElement('p');
    pass_rules.style.marginTop = '10px';
    pass_rules.style.color = 'red';
    pass_rules.style.fontWeight = '600'
    pass_rules.style.fontSize = '2.1vh'
    strength_message.parentNode.append(pass_rules);
    pass_rules.textContent = 'Password should contain at least 8 Characters including an Uppercase , a Lowercase , a Number and a Special Symbol.';

    if (accept_pass == false) {
            pass.addEventListener('input', function () {

            const password = pass.value;

            // Clear previous message
            strength_message.textContent = '';

            // Run password strength check
            const strength = checkPasswordStrength(password);
 
            // Update message and color based on strength
            if (strength === 'Strong') {
                strength_message.textContent = 'Strong password';
                strength_message.style.color = 'green';
                accept_pass = true;
            } 
            else if (strength === 'Moderate') {
                strength_message.textContent = 'Moderate password';
                strength_message.style.color = 'orange';
                accept_pass = false;
            } 
            else {
                strength_message.textContent = 'Weak password';
                strength_message.style.color = 'red';
                accept_pass = false;
            }
        });
    }


    // Detect Form Submission Activity / Event
    reset_form.addEventListener('submit', function(event) {

        // Stop Form Submission for Checking
        event.preventDefault();

        // Get the reset token from the URL and set it in the form action
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token'); // Get the reset token
        if (token) { document.getElementById('reset_form').action = `/reset-password/${token}`; }
        else { alert('Invalid Reset Token.'); }

        // Get User Input Passwords for Checking
        const password = document.getElementById('password');
        const confirm_password = document.getElementById('confirm_password');
        
        // Validate Password Strength
        if (!accept_pass) {}
         
        // If Passwords do NOT match.
        else if ( password.value != confirm_password.value ) {
            alert("Password and Confirmed Password do NOT match. Please confirm your password again."); // Display Message to User
            password.value = ''; // Clear Password Field
            confirm_password.value = ''; // Clear Confirm Password Input Field
        }

        else { reset_form.submit(); }
    }
    )
}
)

// Function to check password strength
function checkPasswordStrength (password) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/; 
    const moderateRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#]{6,}$/; 

    if (strongRegex.test(password)) { return 'Strong'; } 
    else if (moderateRegex.test(password)) { return 'Moderate'; } 
    else { return 'Weak'; }
}
