
import Joi from 'joi';

export const profileSchema = Joi.object({
  bio: Joi.string().max(500).allow('').optional(),
  location: Joi.string().max(100).allow('').optional(),
  availability: Joi.string().max(100).allow('').optional(),
  language: Joi.string().max(50).allow('').optional(),  
  timezone: Joi.string().max(50).allow('').optional(),
  teachSkills: Joi.string().allow('').optional(),
  learnSkills: Joi.string().allow('').optional(),
  experienceLevel: Joi.string()
    .valid('', 'Beginner', 'Intermediate', 'Advanced', 'Expert')
    .allow('')
    .optional(),
  hourlyRate: Joi.alternatives()
    .try(
      Joi.number().min(0).max(999999),
      Joi.string().allow(''),
      Joi.allow(null)
    )
    .optional(),
  
  website: Joi.string().uri().allow('').optional(),
  github: Joi.string().uri().allow('').optional(),
  linkedin: Joi.string().uri().allow('').optional(),
  twitter: Joi.string().uri().allow('').optional()
}).options({ 
  allowUnknown: false,  
  stripUnknown: false   
});