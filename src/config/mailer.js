import { NODEMAILER_EMAIL, NODEMAILER_PASS } from "../constant/node-mailer.js";
import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_PASS,
    },
    from: NODEMAILER_EMAIL,
});
