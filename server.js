<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Submission</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        .message {
            margin-top: 20px;
            color: green;
        }
        .error {
            color: red;
        }
    </style>
</head>
<body>

    <h2>Submit Your Details</h2>
    <form id="userForm">
        <label for="name">Name:</label><br>
        <input type="text" id="name" name="name" required><br>
        
        <label for="email">Email:</label><br>
        <input type="email" id="email" name="email" required><br>
        
        <label for="phone">Phone Number:</label><br>
        <input type="tel" id="phone" name="phone" required><br><br>
        
        <button type="submit">Submit</button>
    </form>

    <div id="message" class="message"></div>
    <div id="error" class="error"></div>

    <h2>Admin Download Responses</h2>
    <input type="password" id="adminPassword" placeholder="Enter Admin Password">
    <button id="downloadBtn">Download Responses</button>

    <script>
        const form = document.getElementById('userForm');
        const messageDiv = document.getElementById('message');
        const errorDiv = document.getElementById('error');
        const downloadBtn = document.getElementById('downloadBtn');
        const adminPasswordInput = document.getElementById('adminPassword');

        // Handle form submission
        form.onsubmit = async (e) => {
            e.preventDefault(); // Prevent form from submitting normally
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            errorDiv.textContent = ''; // Clear previous errors
            messageDiv.textContent = ''; // Clear previous messages

            try {
                const response = await fetch('http://localhost:5000/api/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    messageDiv.textContent = 'Thank you for your submission!';
                    disableBackButtons(); // Disable back navigation
                } else {
                    errorDiv.textContent = result.message; // Show the error message
                }
            } catch (error) {
                errorDiv.textContent = 'An error occurred. Please try again later.';
            }
        };

        // Handle admin password and download responses
        downloadBtn.onclick = async () => {
            const password = adminPasswordInput.value;

            if (!password) {
                alert('Please enter the admin password.');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password }) // Send password in body
                });

                if (response.ok) {
                    // If the request is successful, download the file
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'responses.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else {
                    const result = await response.json();
                    alert(result.message); // Show unauthorized access message
                }
            } catch (error) {
                alert('An error occurred while trying to download the responses.');
            }
        };

        // Disable back buttons after submission
        function disableBackButtons() {
            history.pushState(null, '', location.href);
            window.onpopstate = function () {
                history.pushState(null, '', location.href);
            };
        }
    </script>

</body>
</html>
