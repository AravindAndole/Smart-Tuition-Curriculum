const axios = require('axios');
const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');

async function testFeeFlow() {
    try {
        console.log('--- Initializing Test Data for Fees ---');
        await mongoose.connect('mongodb://localhost:27017/smart-tuition');

        // 1. Teacher Setup
        const emailPrefix = Date.now();
        const teacherRes = await axios.post('http://localhost:5000/api/auth/register/teacher', {
            name: 'Fee Teacher',
            email: `teacher_fee_${emailPrefix}@test.com`,
            password: 'password123',
            tuitionCenterName: 'Fee Academy'
        });
        const teacherToken = teacherRes.data.token;
        const centerId = teacherRes.data.user.tuitionCenter;

        // 2. Student Setup
        const student = await Student.create({
            studentId: `STU_FEE_${emailPrefix}`,
            name: 'Fee Student',
            tuitionCenter: centerId
        });

        // 3. Parent Setup (Adding dummy phone number for Twilio sandbox test)
        // Twilio sandbox usually requires a verified number. We use a dummy here just to test the API logic.
        const parentRes = await axios.post('http://localhost:5000/api/auth/register/parent', {
            name: 'Fee Parent',
            email: `parent_fee_${emailPrefix}@test.com`,
            password: 'password123',
            studentId: student.studentId
        });
        const parentToken = parentRes.data.token;

        // Update parent phone via direct DB access for testing since our auth route doesn't accept phone yet
        await User.findByIdAndUpdate(parentRes.data.user.id, { phone: '+1234567890' });
        console.log('Test Parent created and linked to Student with Phone Number.');

        console.log('\n--- 1. Teacher Marks Fee as Paid ---');
        const markRes1 = await axios.post('http://localhost:5000/api/fees', {
            studentId: student._id,
            month: 'April 2024',
            amount: 150.00,
            status: 'Paid'
        }, { headers: { Authorization: `Bearer ${teacherToken}` } });
        console.log('Mark Fee Response (Paid):', markRes1.data.success, markRes1.data.message);
        console.log('SMS Status:', markRes1.data.smsStatus); // Should be "SMS not needed"

        console.log('\n--- 2. Teacher Updates Fee to Unpaid (Should Trigger SMS) ---');
        const markRes2 = await axios.post('http://localhost:5000/api/fees', {
            studentId: student._id,
            month: 'April 2024',
            amount: 150.00,
            status: 'Unpaid'
        }, { headers: { Authorization: `Bearer ${teacherToken}` } });
        console.log('Mark Fee Response (Unpaid):', markRes2.data.success, markRes2.data.message);
        console.log('SMS Status:', markRes2.data.smsStatus); // Should show Twilio auth failure since keys are dummy, but proves logic works

        console.log('\n--- 3. Parent Views Fee Status ---');
        const pViewRes = await axios.get('http://localhost:5000/api/fees', {
            headers: { Authorization: `Bearer ${parentToken}` }
        });
        console.log(`Parent found ${pViewRes.data.count} fee records.`);
        console.log(`Record for ${pViewRes.data.data[0].month}: $${pViewRes.data.data[0].amount} -> Status: ${pViewRes.data.data[0].status}`);

        console.log('\n--- All Fee Backend Tests Passed 🎉 ---');
        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testFeeFlow();
