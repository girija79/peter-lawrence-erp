require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const caseRoutes = require('./routes/caseRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const clientPaymentRoutes = require('./routes/clientPaymentRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const careerRoutes = require('./routes/careerRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const pettyCashRoutes = require('./routes/pettyCashRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cmsPageRoutes = require("./routes/cmsPageRoutes");
const cmsServiceRoutes = require("./routes/cmsServiceRoutes");
const cmsPostRoutes = require("./routes/cmsPostRoutes");
const cmsInquiryRoutes = require("./routes/cmsInquiryRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/client-payments', clientPaymentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/petty-cash', pettyCashRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/cms-pages", cmsPageRoutes);
app.use("/api/cms-services", cmsServiceRoutes);
app.use("/api/cms-posts", cmsPostRoutes);
app.use("/api/cms-inquiries", cmsInquiryRoutes);

const testRoutes = require('./routes/testRoutes');
app.use('/api/test', testRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));