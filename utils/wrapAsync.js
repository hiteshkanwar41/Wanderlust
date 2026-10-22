module.exports=(fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch((err)=>next(err));
    }
}


// *we directly exported this fxn*
// 
// function wrapAsync(fn){
//     return function(req,res,next){
//         fn(req,res,next).catch((err)=>next(err));
//     }
// }