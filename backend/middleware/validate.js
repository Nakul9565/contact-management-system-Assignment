const { z } = require('zod');

// ZOD SCHEMAS

const signupSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please enter a valid email address (e.g. name@example.com)'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

const contactSchema = z.object({
  name: z
    .string({ required_error: 'Contact name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please enter a valid email address (e.g. user@domain.com)'),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^[\d\s().-]+$/, 'Please enter a valid phone number')
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length <= 10;
      },
      { message: 'Phone number cannot exceed 10 digits' }
    )
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length >= 10;
      },
      { message: 'Phone number must be a valid 10-digit Indian number (e.g. 9876543210)' }
    ),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] || 'general';
        formattedErrors[fieldName] = issue.message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted errors.',
        errors: formattedErrors,
      });
    }

    req.body = result.data;
    next();
  };
}

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  contactSchema,
};
