const Fee = require('../models/Fee');
const Student = require('../models/Student');
const User = require('../models/User');
const twilio = require('twilio');

// Initialize twilio client using environment variables
// Normally you'd keep these securely in .env
// Using dummy fallback logic to prevent crash if .env keys are missing
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_dummy_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'dummy_auth_token';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
const client = twilio(accountSid, authToken);

// @desc    Mark a fee as Paid or Unpaid
// @route   POST /api/fees
// @access  Private (Teacher Only)
exports.markFee = async (req, res) => {
    try {
        const { studentId, month, amount, status } = req.body;

        const teacher = await User.findById(req.user.id);
        if (!teacher.tuitionCenter) {
            return res.status(400).json({ message: 'Teacher is not linked to any Tuition Center' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.tuitionCenter.toString() !== teacher.tuitionCenter.toString()) {
            return res.status(403).json({ message: 'Student does not belong to your Tuition Center' });
        }

        let fee = await Fee.findOne({
            student: studentId,
            tuitionCenter: teacher.tuitionCenter,
            month: month
        });

        let isStatusChangedToUnpaid = false;

        if (fee) {
            // Check if status changed from Paid to Unpaid (or was already Unpaid)
            if (fee.status !== 'Unpaid' && status === 'Unpaid') {
                isStatusChangedToUnpaid = true;
            }
            // Update
            fee.amount = amount || fee.amount;
            fee.status = status;
            fee.markedBy = req.user.id;
            await fee.save();
        } else {
            // Create new
            fee = await Fee.create({
                student: studentId,
                tuitionCenter: teacher.tuitionCenter,
                month: month,
                amount: amount,
                status: status,
                markedBy: req.user.id
            });
            if (status === 'Unpaid') {
                isStatusChangedToUnpaid = true;
            }
        }

        // Trigger Twilio SMS if marked as Unpaid
        let smsStatus = 'SMS not needed';
        if (isStatusChangedToUnpaid) {
            // Find the parent associated with this student
            const parent = await User.findOne({ student: studentId, role: 'parent' });

            if (parent && parent.phone) {
                try {
                    // Attempt to send SMS using Twilio Sandbox Mode
                    // In Sandbox, the destination number must be verified on your Twilio console
                    const message = await client.messages.create({
                        body: `Alert from ${teacher.tuitionCenterName || 'Tuition Center'}: Fee for ${student.name} for the month of ${month} is Unpaid (Amount: $${fee.amount}).`,
                        from: twilioPhoneNumber,
                        to: parent.phone
                    });
                    smsStatus = `SMS queued with SID: ${message.sid}`;
                } catch (twilioErr) {
                    // We'll log the error but still return a successful DB transaction
                    console.error('Twilio Error:', twilioErr.message);
                    smsStatus = `SMS failed: Check Twilio credentials or verify Sandbox target. (${twilioErr.message})`;
                }
            } else {
                smsStatus = 'No valid parent phone number found to send SMS';
            }
        }

        res.status(200).json({
            success: true,
            message: 'Fee status updated',
            smsStatus: smsStatus,
            data: fee
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Fee record already exists for this student for this month' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get fee records
// @route   GET /api/fees
// @access  Private (Teacher, Parent)
exports.getFees = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let query = {};

        if (req.user.role === 'teacher') {
            if (!user.tuitionCenter) return res.status(400).json({ message: 'No center linked' });
            query.tuitionCenter = user.tuitionCenter;
            if (req.query.studentId) query.student = req.query.studentId;
            if (req.query.month) query.month = req.query.month;
            if (req.query.status) query.status = req.query.status;
        } else if (req.user.role === 'parent' || req.user.role === 'student') {
            if (!user.student) return res.status(400).json({ message: 'No student linked' });
            query.student = user.student;
            if (req.query.month) query.month = req.query.month;
            if (req.query.status) query.status = req.query.status;
        }

        const fees = await Fee.find(query)
            .populate('student', 'name studentId')
            .populate('markedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: fees.length, data: fees });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
