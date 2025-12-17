const responseUtils = require('../../utils/responseUtils');                                                      
const rolePermissions = require('./rolePermissions');                                                      
                                                                                                                                                                                                              
const rbacMiddleware = (requiredPermissions) => async (req, res, next) => {                                
    if (!req.user) {                                                                                         
        return responseUtils.unauthorized(res, 'Authentication required before role check');                   
    }                                                                                                        
                                                                                                                
    const userRole = req.user.role;                                                                          
    const allowedPermissions = rolePermissions[userRole] || [];                                              
                                                                                                                
    // Admin shortcut or wildcard permission                                                                 
    const hasWildcard = allowedPermissions.includes('*');                                                    
    const required = Array.isArray(requiredPermissions)                                                      
        ? requiredPermissions                                                                                  
        : [requiredPermissions];                                                                               
                                                                                                                
    const isAuthorized =                                                                                     
        hasWildcard ||                                                                                         
        required.some((perm) => allowedPermissions.includes(perm));                                            
                                                                                                                
    if (!isAuthorized) {                                                                                     
        return responseUtils.error(res,`Role ${userRole} lacks required permission (${required.join(', ')})`);                                                                                                     
    }                                                                                                        
                                                                                                                
    return next();                                                                                           
};                                                                                                         
                                                                                                            
module.exports = rbacMiddleware;  