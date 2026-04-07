const axios = require('axios');
const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');

async function testAttendanceFlow() {
    try {
        console.log('--- Initializing Test Data ---');
        // Connect to DB directly to clean up or set up specific states if needed
        await mongoose.connect('mongodb://localhost:27017/smart-tuition');

        // 1. Teacher Login (Assume teacher from earlier test still exists)
        // Create new for isolation
        const emailPrefix = Date.now();
        const teacherRes = await axios.post('http://localhost:5000/api/auth/register/teacher', {
            name: 'Attendance Teacher',
            email: `teacher_${emailPrefix}@test.com`,
            password: 'password123',
            tuitionCenterName: 'Attendance Academy'
        });
        const teacherToken = teacherRes.data.token;
        const centerId = teacherRes.data.user.tuitionCenter;

        // 2. Mock a Student in that Center
        const student = await Student.create({
            studentId: `STU_${emailPrefix}`,
            name: 'Attendance Student',
            tuitionCenter: centerId
        });

        // 3. Parent Login
        const parentRes = await axios.post('http://localhost:5000/api/auth/register/parent', {
            name: 'Attendance Parent',
            email: `parent_${emailPrefix}@test.com`,
            password: 'password123',
            studentId: student.studentId
        });
        const parentToken = parentRes.data.token;

        console.log('\n--- 1. Teacher Marks Attendance (Success) ---');
        const markRes = await axios.post('http://localhost:5000/api/attendance', {
            studentId: student._id,
            status: 'Present'
        }, { headers: { Authorization: `Bearer ${teacherToken}` } });
        console.log('Mark Attendance Response:', markRes.data.success, markRes.data.message);

        console.log('\n--- 2. Parent Tries to Mark Attendance (Should Fail) ---');
        try {
            await axios.post('http://localhost:5000/api/attendance', {
                studentId: student._id,
                status: 'Absent'
            }, { headers: { Authorization: `Bearer ${parentToken}` } });
            console.log('ERROR: Parent was able to mark attendance!');
        } catch (err) {
            console.log('Expected Failure:', err.response.data.message);
        }

        console.log('\n--- 3. Teacher Views Attendance ---');
        const tViewRes = await axios.get('http://localhost:5000/api/attendance', {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log(`Teacher found ${tViewRes.data.count} records. Record Status:`, tViewRes.data.data[0].status);

        console.log('\n--- 4. Parent Views Attendance ---');
        const pViewRes = await axios.get('http://localhost:5000/api/attendance', {
            headers: { Authorization: `Bearer ${parentToken}` }
        });
        console.log(`Parent found ${pViewRes.data.count} records. Record Status:`, pViewRes.data.data[0].status);

        console.log('\n--- All Attendance Backend Tests Passed 🎉 ---');
        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testAttendanceFlow();
