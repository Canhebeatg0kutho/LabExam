module.exports.isAuth = (req, res, next) => {
    if(!req.session.isLoggedIn){
        res.status(401).json({ msg: 'You are not authorized to view this resource' });
       }else{
        next();
       }
}
