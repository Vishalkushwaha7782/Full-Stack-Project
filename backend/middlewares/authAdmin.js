import jwt from "jsonwebtoken";

// admin authentication middleware

const authAdmin = async (req, res, next) => {
  try {
    console.log("HEADERS:", req.headers);
    const atoken = req.headers.atoken;

    console.log("RECEIVED TOKEN:", atoken);

    if (!atoken) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    // verify token
    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

    console.log("DECODE:", token_decode);

    // check email from token
    if (token_decode.email !== process.env.ADMIN_EMAIL) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export default authAdmin;
