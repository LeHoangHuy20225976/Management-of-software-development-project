const rolePermissions = {                                                                                                                  
  customer: [                                                                                                                                                                                                                                                 
    'profile:view_own',                                                                                                                    
    'profile:update_own',                                                                                                                  
    // Booking flow (bookingRoutes.js endpoints)                                                                                           
    'booking:create',                                                                                                                      
    'booking:view_own',                                                                                                                    
    'booking:update_own',                                                                                                                  
    'booking:cancel_own',                                                                                                                  
    'booking:check_availability',                                                                                                          
    'booking:calculate_price',                                                                                                             
    'booking:view_available_rooms',                                                                                                        
  ],                                                                                                                                       
  hotel_manager: [                                                                                                                         
    // Hotel Profile module duties (task.md:21-29)                                                                                         
    'hotel:create',                                                                                                                        
    'hotel:update',                                                                                                                        
    'hotel:view_owned',                                                                                                                    
    'hotel:manage_media',                                                                                                                  
    // Room & Inventory ownership (task.md:31-39)                                                                                          
    'room:create',                                                                                                                         
    'room:update',                                                                                                                         
    'room:update_status',                                                                                                                  
    'inventory:view',                                                                                                                      
    'inventory:update',                                                                                                                    
    // Booking oversight for their property (task.md:41-49)                                                                                
    'booking:view_for_hotel',                                                                                                              
    'booking:update_status',                                                                                                               
    'booking:checkin',                                                                                                                     
    'booking:checkout',                                                                                                                    
    // Pricing coordination (task.md:51-59)                                                                                                
    'pricing:view',                                                                                                                        
    'pricing:update',                                                                                                                      
  ],                                                                                                                                       
  admin: [                                                                                                                                 
    // Admin/super admin duties (task.md:13-21 & 59-67)                                                                                    
    'user:view_all',                                                                                                                       
    'user:manage',                                                                                                                         
    'hotel:approve_manager',                                                                                                               
    'hotel:lock_manager',                                                                                                                  
    'config:manage',                                                                                                                       
    'dashboard:view_metrics',                                                                                                              
    // Full oversight of other modules                                                                                                     
    'booking:view_all',                                                                                                                    
    'booking:update_status',                                                                                                               
    'booking:cancel_any',                                                                                                                  
    'room:manage_all',                                                                                                                     
    'inventory:manage_all',                                                                                                                
    'pricing:manage_all',                                                                                                                  
    'notification:manage',                                                                                                                 
    'payment:manage',                                                                                                                      
    'synchronization:manage',                                                                                                              
    '*', // keep wildcard for future unrestricted actions                                                                                  
  ],                                                                                                                                       
};           
module.exports = rolePermissions;