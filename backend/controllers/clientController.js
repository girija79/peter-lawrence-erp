
const Client = require('../models/Client');
const Case = require('../models/Case');
const Lawyer = require('../models/Lawyer');


// @desc    Get clients based on logged-in user's role
// @route   GET /api/clients
exports.getClients = async (req, res) => {
    try {

        // ADMIN
        // Admin can view the complete client directory.
        if (req.user.role === 'admin') {

            const clients = await Client.find()
                .sort({ createdAt: -1 });

            return res.status(200).json(clients);
        }


        // ACCOUNTANT
        // Accountant can view the complete client directory
        // for billing and client payment management.
        if (req.user.role === 'accountant') {

            const clients = await Client.find()
                .sort({ createdAt: -1 });

            return res.status(200).json(clients);
        }


        // LAWYER
        // Lawyer can only view clients connected
        // to cases assigned to that lawyer.
        if (req.user.role === 'lawyer') {

            const lawyer = await Lawyer.findOne({
                userId: req.user._id
            });

            if (!lawyer) {
                return res.status(404).json({
                    message: 'Lawyer profile not found'
                });
            }

            const cases = await Case.find({
                lawyerId: lawyer._id
            }).select('clientId');

            const clientIds = [
                ...new Set(
                    cases
                        .map((legalCase) =>
                            legalCase.clientId?.toString()
                        )
                        .filter(Boolean)
                )
            ];

            const clients = await Client.find({
                _id: { $in: clientIds }
            }).sort({ createdAt: -1 });

            return res.status(200).json(clients);
        }


        // CLIENT
        // A client can only see their own client profile.
        if (req.user.role === 'client') {

            const client = await Client.findOne({
                userId: req.user._id
            });

            if (!client) {
                return res.status(404).json({
                    message: 'Client profile not found'
                });
            }

            return res.status(200).json([client]);
        }


        return res.status(403).json({
            message: 'Access denied: insufficient permissions'
        });

    } catch (error) {

        console.error('Get Clients Error:', error);

        res.status(500).json({
            message: 'Failed to fetch clients',
            error: error.message
        });
    }
};


// @desc    Get single client
// @route   GET /api/clients/:id
exports.getClientById = async (req, res) => {
    try {

        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }


        // ADMIN can view any client.
        if (req.user.role === 'admin') {
            return res.status(200).json(client);
        }


        // ACCOUNTANT can view any client.
        // This is read-only access for billing and payment management.
        if (req.user.role === 'accountant') {
            return res.status(200).json(client);
        }


        // LAWYER can only view a client
        // if that client belongs to one of their cases.
        if (req.user.role === 'lawyer') {

            const lawyer = await Lawyer.findOne({
                userId: req.user._id
            });

            if (!lawyer) {
                return res.status(404).json({
                    message: 'Lawyer profile not found'
                });
            }

            const assignedCase = await Case.findOne({
                lawyerId: lawyer._id,
                clientId: client._id
            });

            if (!assignedCase) {
                return res.status(403).json({
                    message: 'Access denied: client is not assigned to you'
                });
            }

            return res.status(200).json(client);
        }


        // CLIENT can only view their own profile.
        if (req.user.role === 'client') {

            if (client.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    message: 'Access denied'
                });
            }

            return res.status(200).json(client);
        }


        return res.status(403).json({
            message: 'Access denied: insufficient permissions'
        });

    } catch (error) {

        console.error('Get Client Error:', error);

        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};


// @desc    Create new client
// @route   POST /api/clients
exports.createClient = async (req, res) => {
    try {

        const {
            fullName,
            email,
            phone,
            address,
            company
        } = req.body;


        if (!fullName || !email) {
            return res.status(400).json({
                message: 'Full name and email are required'
            });
        }


        const clientExists = await Client.findOne({ email });

        if (clientExists) {
            return res.status(400).json({
                message: 'Client with this email already exists'
            });
        }


        const client = await Client.create({
            userId: req.user._id,
            fullName,
            email,
            phone,
            address,
            company
        });

        res.status(201).json(client);

    } catch (error) {

        console.error('Create Client Error:', error);

        res.status(400).json({
            message: error.message
        });
    }
};


// @desc    Update client
// @route   PUT /api/clients/:id
exports.updateClient = async (req, res) => {
    try {

        const {
            fullName,
            email,
            phone,
            address,
            company
        } = req.body;


        const client = await Client.findByIdAndUpdate(
            req.params.id,
            {
                fullName,
                email,
                phone,
                address,
                company
            },
            {
                new: true,
                runValidators: true
            }
        );


        if (!client) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }


        res.status(200).json(client);

    } catch (error) {

        console.error('Update Client Error:', error);

        res.status(400).json({
            message: error.message
        });
    }
};


// @desc    Delete client
// @route   DELETE /api/clients/:id
exports.deleteClient = async (req, res) => {
    try {

        const client = await Client.findByIdAndDelete(
            req.params.id
        );


        if (!client) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }


        res.status(200).json({
            message: 'Client removed successfully'
        });

    } catch (error) {

        console.error('Delete Client Error:', error);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};