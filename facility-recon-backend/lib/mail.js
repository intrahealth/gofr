const nodemailer = require('nodemailer');
const Cryptr = require('cryptr');
const config = require('./config');
const mongo = require('./mongo')();
const logger = require('./winston');

const cryptr = new Cryptr(config.getConf('auth:secret'));

module.exports = () => ({
  send(subject, text, to, callback) {
    mongo.getSMTP((err, smtp) => {
      if (err) {
        logger.error('An error occured while getting SMTP config');
        return;
      }
      if (!smtp) {
        logger.warn('No SMTP COnfiguration Found, Email notifications will not be sent');
        return callback();
      }
      if (!smtp.host || !smtp.username || !smtp.password) {
        logger.warn('Invalid SMTP, cant send notification emails');
        return callback();
      }
      const {
        host,
        port,
        secured,
        username,
        password,
      } = smtp;
      to = to.join(',');
      if (!to) {
        logger.warn('Missing email address of the recipient, cant send notification email');
        return callback();
      }
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: secured,
        auth: {
          user: username,
          pass: cryptr.decrypt(password),
        },
      });

      const mailOptions = {
        from: `"Facility Registry"<${username}>`,
        to,
        subject,
        text,
      };
      logger.info(`Sending email to ${to} with subject ${subject}`);
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error(error);
          return callback();
        }
        logger.info(JSON.stringify(info, 0, 2));
        return callback();
      });
    });
  },
});
