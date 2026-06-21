const { z } = require('zod');
const mongoose = require('mongoose');

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.slice(1).join('.'),
          message: e.message,
        }));
        return res.fail('Validation failed', 400, { errors });
      }
      next(err);
    }
  };
}

const objectId = z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), {
  message: 'Invalid ID format',
});

module.exports = { validate, objectId, z };
