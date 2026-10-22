const Joi =require("joi");
const { cities } = require("../constants.js");

module.exports.listingSchema=Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().required(),

        description: Joi.string().trim().required(),

        price: Joi.number().min(0).required(),

        image: Joi.object({
            url: Joi.string().allow("", null),
            filename:Joi.string().allow("", null),
        }),

        city: Joi.string()
            .valid(...cities)
            .required(),

        neighbourhood: Joi.string()
            .trim()
            .required(),

        roomType: Joi.string()
            .valid(
                "Entire home/apt",
                "Private room",
                "Shared room",
                "Hotel room"
            )
            .required(),

        accommodates: Joi.number()
            .integer()
            .min(1)
            .required(),

        bathrooms: Joi.number()
            .min(0)
            .required(),

        bedrooms: Joi.number()
            .integer()
            .min(0)
            .required(),

        beds: Joi.number()
            .integer()
            .min(1)
            .required(),

        latitude: Joi.number(),

        longitude: Joi.number(),
    }).required()
});

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required()
    }).required()
});

module.exports.bookingSchema = Joi.object({
    booking: Joi.object({
        checkIn: Joi.date().required(),
        checkOut: Joi.date().greater(Joi.ref("checkIn")).required(),
        guests: Joi.number().integer().min(1).required()
    }).required()
});

