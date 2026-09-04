const Client = require('../models/Client');

// @desc    Get all clients
// @route   GET /api/clients
exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find()
            .sort({ createdAt: -1 });

        res.status(200).json(clients);

    } catch (error) {
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

        res.status(200).json(client);

    } catch (error) {
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

        // Validate required fields
        if (!fullName || !email) {
            return res.status(400).json({
                message: 'Full name and email are required'
            });
        }

        // Check duplicate email
        const clientExists = await Client.findOne({ email });

        if (clientExists) {
            return res.status(400).json({
                message: 'Client with this email already exists'
            });
        }

        // Create client using logged-in user's ID
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
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};