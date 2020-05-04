const Bootcamp = require('../models/bootcampModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = async (req, res, next) => {
	const bootcamps = await Bootcamp.find();
	res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
};

// @desc        Get single bootcamps
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(new AppError(`There are no bootcamp for this id : ${req.params.id}`, 404));
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({ success: true, data: bootcamp });
});

// @desc        Upadate a bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});
	if (!bootcamp) {
		return res.status(404).json({ success: false, data: null });
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Delete a bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	res.status(200).json({ success: true, data: bootcamp });
});
