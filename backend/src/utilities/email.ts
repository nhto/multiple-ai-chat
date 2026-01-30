import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import logger from "./../utilities/logger";
import { promises as fs } from "fs";
import path from "path";
import { Liquid } from "liquidjs";
import { ApiError } from "../models/error";
import * as config from "../utilities/config";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const smtpConfig: SMTPTransport.Options = {
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_SECURE,
};

// for mailHog local test
// {
//   host: "localhost",
//   port: 1025,
//   // secure: false,
// }

if (!!config.SMTP_USER && !!config.SMTP_PASSWORD) {
  smtpConfig.auth = {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD,
  };
}

if (config.SMTP_TLS) {
  smtpConfig.tls = {
    ciphers: "SSLv3",
  };
}

async function sendEmail(
  mailOptions: Mail.Options
): Promise<SMTPTransport.SentMessageInfo> {
  logger.info(
    `Sending email: ${mailOptions.messageId} / ${
      mailOptions.subject
    } / ${JSON.stringify(mailOptions.to)}`
  );
  try {
    const smtpTransport = nodemailer.createTransport(smtpConfig);
    const result = await smtpTransport.sendMail(mailOptions);
    smtpTransport.close();
    logger.info(`Sent email ${result.messageId} / ${mailOptions.subject}`);

    return result;
  } catch (err) {
    logger.error(`Error sending email: ${err}`);
    throw new ApiError("Error sending email");
  }
}

const engine = new Liquid({
  root: path.resolve(__dirname, "../emailtemplate/"), // root for layouts/includes lookup
  extname: ".liquid", // used for layouts/includes, defaults ""
});

interface TemplateConfig {
  from: string;
  subject: string;
  isHtml: boolean;
}

async function renderEmail(
  template: string,
  to: string[],
  cc: string[],
  bcc: string[],
  params?: any
): Promise<Mail.Options> {
  const metadataFile = path.resolve(
    __dirname,
    "../emailtemplate/",
    template + ".json"
  );
  let metadata: TemplateConfig = null;

  try {
    metadata = JSON.parse(
      await fs.readFile(metadataFile, { encoding: "utf-8" })
    );
  } catch (err) {
    logger.error(`Error reading email metadata file ${template}`);
    throw new ApiError("Error sending email.");
  }

  logger.debug(metadata);

  function utf8ToUnicode(utf8String: any) {
    const decoder = new TextDecoder("utf-8");
    const utf8Array = new Uint8Array(
      [...utf8String].map((c) => c.charCodeAt(0))
    );
    const unicodeString = decoder.decode(utf8Array);
    return unicodeString;
  }

  if (params?.SuccessfulUploads) {
    for (let i = 0; i < params.SuccessfulUploads.length; i++) {
      params.SuccessfulUploads[i] = utf8ToUnicode(params.SuccessfulUploads[i]);
    }
  }

  const body: string = await engine.renderFile(template, params);

  const mailOptions: Mail.Options = {
    from: config.SMTP_FROM_OVERRIDE || metadata.from,
    to,
    cc,
    bcc,
    subject: metadata.subject,
  };

  if (metadata.isHtml) {
    mailOptions.html = body;
  } else {
    mailOptions.text = body;
  }

  return mailOptions;
}

export { renderEmail, sendEmail };
