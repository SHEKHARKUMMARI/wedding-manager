const Joi = require("joi");
const validateLoginCredentials = (data) => {
  const credentials = Joi.object({
    user_id: Joi.string().required(),
    password: Joi.string().required(),
  });
  return credentials.validate(data, { abortEarly: false });
};
module.exports = { validateLoginCredentials };
