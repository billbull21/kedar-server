const nodemailer = require("nodemailer");

const {
    EMAIL_SENDER,
    BASE_URL,
    PASS_SENDER
} = process.env;

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EMAIL_SENDER,
    pass: PASS_SENDER
  },
});


module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  console.log("Check");
  transport.sendMail({
    from: EMAIL_SENDER,
    to: email,
    subject: "Please confirm your account",
    html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <a href=http://${BASE_URL}/api/user/confirm/${confirmationCode}>Click here</a>
        </div>`,
  }).catch(err => console.log(err));
};