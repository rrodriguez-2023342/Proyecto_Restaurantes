import { validationResult } from 'express-validator';

export const checkValidators = (req, res, next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        const errorList = errors.array().map(err => `${err.path || err.param}: ${err.msg}`).join(', ');
        return res.status(400).json({
            success: false,
            message: `Error de validación: ${errorList}`,
            errors: errors.array()
        })
    }

    next();
}
