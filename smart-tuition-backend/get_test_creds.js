const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ email: String, role: String, password: String, student: mongoose.Schema.Types.ObjectId, tuitionCenter: mongoose.Schema.Types.ObjectId });
const User = mongoose.model('User', userSchema);
const bcrypt = require('bcryptjs');

async function getCredentials() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/smart-tuition');

        let teacher = await User.findOne({ role: 'teacher' });
        if (teacher) { // Force password to password123 for testing
            teacher.password = await bcrypt.hash('password123', 10);
            await teacher.save();
        }

        let student = await User.findOne({ role: 'student' });
        if (student) {
            student.password = await bcrypt.hash('password123', 10);
            await student.save();
        }

        let parent = await User.findOne({ role: 'parent' });
        if (parent) {
            parent.password = await bcrypt.hash('password123', 10);
            await parent.save();
        }

        console.log(`TEACHER: ${teacher ? teacher.email : 'None'} / password123`);
        console.log(`STUDENT: ${student ? student.email : 'None'} / password123`);
        console.log(`PARENT: ${parent ? parent.email : 'None'} / password123`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
getCredentials();
