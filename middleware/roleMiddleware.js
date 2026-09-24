// role check middleware, use it like: router.post('/', allowRoles("admin","hod"), async(req,res)=>{ ... })
// runs after authMiddleware so req.user is already there
const allowRoles = (...roles) => {
  // returns the actual middleware func
  return (req, res, next) => {
    // if user's role isnt in the allowed list -> 403 (logged in but not allowed)
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied for role: " + req.user.role,
      });
    }
    // role is ok, go to the route
    next();
  };
};
module.exports = allowRoles;
