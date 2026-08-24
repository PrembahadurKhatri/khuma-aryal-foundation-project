import { validationResult } from "express-validator";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // `message` (the first failing field's message) is included alongside
    // the full `errors` array so every existing frontend page that only
    // ever reads `err.response.data.message` (the vast majority of them)
    // still shows something real instead of falling through to a generic
    // fallback string on any validation failure — this was silently true
    // for any 400 from this middleware until now.
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

export default validate;
