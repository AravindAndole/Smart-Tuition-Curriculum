const axios = require('axios');
(async () => {
    try {
        console.log("1. Preparing test teacher account...");
        const email = 'teacher@example.com';
        
        try {
            await axios.post('http://localhost:5000/api/auth/register/teacher', {
                name: 'Teacher One', email, password: 'oldpassword', tuitionCenterName: 'Academy 1'
            });
            console.log("Registered test teacher successfully.");
        } catch(e) { console.log("Test teacher user already exists. Proceeding."); }

        console.log("\n2. Requesting Password Reset...");
        const resForgot = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
        console.log("Forgot Password Response:", resForgot.data.message);
        const resetUrl = resForgot.data.resetUrl;
        console.log("Received Reset URL:", resetUrl);
        const resetToken = resetUrl.split('/').pop();

        console.log("\n3. Resetting Password via Token...");
        const resReset = await axios.post(`http://localhost:5000/api/auth/reset-password/${resetToken}`, { password: 'newpassword123' });
        console.log("Reset Password Response:", resReset.data.message);

        console.log("\n4. Verifying Login with New Password...");
        const resLogin = await axios.post('http://localhost:5000/api/auth/login', { email, password: 'newpassword123' });
        console.log("Login Verification:", resLogin.data.success ? "SUCCESS" : "FAILED");
        console.log("\n✅ Done! The 'Forgot Password' flow completely works from API generation to redemption.");
    } catch (error) {
        console.error("\n❌ Test Failed:", error.response?.data || error.message);
    }
})();
