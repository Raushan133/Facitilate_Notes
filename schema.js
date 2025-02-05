const Joi = require("joi");

const noteSchema = Joi.object({
  note: Joi.object({
    subject: Joi.string().required(),
    image: Joi.object({
      url: Joi.string().required(),
      filename: Joi.string().required(),
    }).required(),
    degree: Joi.string().required(),
    college: Joi.string().required(),
    year: Joi.number().required().min(0),
  }).required(),
});

module.exports = noteSchema;
