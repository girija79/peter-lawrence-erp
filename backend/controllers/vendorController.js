const Vendor = require('../models/Vendor');

// Get all vendors
const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    res.json(vendors);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch vendors',
      error: error.message
    });
  }
};

// Get vendor by ID
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }

    res.json(vendor);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch vendor',
      error: error.message
    });
  }
};

// Create vendor
const createVendor = async (req, res) => {
  try {
    const {
      vendorName,
      contactPerson,
      email,
      phone,
      address,
      serviceType,
      contractDetails,
      paymentTerms,
      status,
      notes
    } = req.body;

    if (!vendorName) {
      return res.status(400).json({
        message: 'Vendor name is required'
      });
    }

    const vendor = await Vendor.create({
      vendorName,
      contactPerson,
      email,
      phone,
      address,
      serviceType,
      contractDetails,
      paymentTerms,
      status,
      notes
    });

    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create vendor',
      error: error.message
    });
  }
};

// Update vendor
const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }

    const allowedFields = [
      'vendorName',
      'contactPerson',
      'email',
      'phone',
      'address',
      'serviceType',
      'contractDetails',
      'paymentTerms',
      'status',
      'notes'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        vendor[field] = req.body[field];
      }
    });

    await vendor.save();

    res.json(vendor);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update vendor',
      error: error.message
    });
  }
};

// Delete vendor
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }

    await vendor.deleteOne();

    res.json({
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete vendor',
      error: error.message
    });
  }
};

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
};