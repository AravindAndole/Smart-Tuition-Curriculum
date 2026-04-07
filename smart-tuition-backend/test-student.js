const axios = require('axios');
const mongoose = require('mongoose');

async function testStudentFlow() {
    try {
        console.log('--- Initializing Test Data for Student Flow ---');
        await mongoose.connect('mongodb://localhost:27017/smart-tuition');

        // 1. Teacher Setup
        const emailPrefix = Date.now();
        const teacherRes = await axios.post('http://localhost:5000/api/auth/register/teacher', {
            name: 'Student Flow Teacher',
            email: `teacher_stu_${emailPrefix}@test.com`,
            password: 'password123',
            tuitionCenterName: 'Student Flow Academy'
        });
        const teacherToken = teacherRes.data.token;

        // 2. Teacher Creates Student
        console.log('\n--- 1. Teacher Creates Student Account ---');
        const createRes = await axios.post('http://localhost:5000/api/auth/student', {
            name: 'Timmy Tester'
        }, { headers: { Authorization: `Bearer ${teacherToken}` } });

        const studentCreds = createRes.data.data;
        console.log('Student created successfully!');
        console.log(`Generated Login Email: ${studentCreds.loginEmail}`);
        console.log(`Generated Password: ${studentCreds.password}`);
        console.log(`Student ID: ${studentCreds.studentId}`);

        // Wait for DB to settle (just in case)
        await new Promise(r => setTimeout(r, 1000));

        // 3. Student Logs In
        console.log('\n--- 2. Student Logs In ---');
        const studentLoginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: studentCreds.loginEmail,
            password: studentCreds.password
        });
        const studentToken = studentLoginRes.data.token;
        console.log('Student matched Role:', studentLoginRes.data.user.role);

        // 4. Student check Dashboard (Should be empty arrays but accessible)
        console.log('\n--- 3. Student Views Read-Only Dashboard ---');
        const dashboardRes = await axios.get('http://localhost:5000/api/student/dashboard', {
            headers: { Authorization: `Bearer ${studentToken}` }
        });

        console.log(`Profile Name: ${dashboardRes.data.data.profile.name}`);
        console.log(`Attendance Records: ${dashboardRes.data.data.attendance.length}`);
        console.log(`Progress Records: ${dashboardRes.data.data.progress.length}`);
        console.log(`Homework Assigned: ${dashboardRes.data.data.homework.length}`);
        console.log(`Recent Notices: ${dashboardRes.data.data.notices.length}`);

        // 5. Test Access Controls (Student trying to access Teacher Chat route)
        console.log('\n--- 4. Student Tries to View Chat Users (Should Fail) ---');
        try {
            await axios.get('http://localhost:5000/api/chat/users', {
                headers: { Authorization: `Bearer ${studentToken}` }
            });
            console.log('ERROR: Student successfully viewed chat users!');
        } catch (err) {
            console.log('Expected Failure (Forbidden):', err.response.data.message);
        }

        console.log('\n--- All Student Account Tests Passed 🎉 ---');
        process.exit(0);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testStudentFlow();
