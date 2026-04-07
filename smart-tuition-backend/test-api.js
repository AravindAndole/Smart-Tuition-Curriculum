const axios = require('axios');

async function runTests() {
    try {
        console.log('--- Testing Teacher Registration ---');
        const teacherRes = await axios.post('http://localhost:5000/api/auth/register/teacher', {
            name: 'Test Teacher',
            email: `teacher${Date.now()}@test.com`,
            password: 'password123',
            tuitionCenterName: 'Test Academy'
        });
        console.log('Teacher Registration Success:', teacherRes.data.success);
        const teacherToken = teacherRes.data.token;

        console.log('\n--- Testing Protected Route (Dashboard as Teacher) ---');
        const dashboardRes = await axios.get('http://localhost:5000/api/auth/dashboard/teacher', {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log('Teacher Dashboard Access:', dashboardRes.data.message);

        console.log('\n--- Testing Parent Registration (Requires Student) ---');
        // We haven't created a 'Student' creation route yet in Phase 1, so the Controller checks for an existing student.
        // For this test, let's create a Student directly in the DB using Mongoose just to test the logic.
        const mongoose = require('mongoose');
        const Student = require('./models/Student');
        await mongoose.connect('mongodb://localhost:27017/smart-tuition');

        // Create a mock student linked to the newly created Tuition Center
        const newStudent = await Student.create({
            studentId: `STU${Date.now()}`,
            name: 'Mock Student',
            tuitionCenter: teacherRes.data.user.tuitionCenter
        });
        console.log('Mock Student created in DB with ID:', newStudent.studentId);

        const parentRes = await axios.post('http://localhost:5000/api/auth/register/parent', {
            name: 'Test Parent',
            email: `parent${Date.now()}@test.com`,
            password: 'password123',
            studentId: newStudent.studentId
        });
        console.log('Parent Registration Success:', parentRes.data.success);

        console.log('\n--- All Core Phase 1 Tests Passed Successfully! ---');
        process.exit(0);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTests();
