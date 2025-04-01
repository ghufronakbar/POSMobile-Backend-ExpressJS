import { mailer } from "../../config/mailer.js";
import { APP_NAME, EMAIL } from "../../constant/index.js";
import { emailTemplate } from "./email-template.js";


export const sendEmail = async (
    target,
    type,
    name,
    body = ""
) => {
    let content = "";
    let message = "";
    let subject = "";
    let isPassword = false;

    switch (type) {
        case "DELETE_ACCOUNT":
            message = "Akun anda telah dihapus";
            content = "Silahkan hubungi admin";
            subject = `Informasi Hapus Akun ${APP_NAME}`;
            isPassword = false;
            break;
        case "CREATE_ACCOUNT":
            message = "Pembuatan akun berhasil";
            content = body;
            subject = `Pembuatan akun ${APP_NAME}`;
            isPassword = true;
            break;
        case "RESET_PASSWORD":
            message = "Reset password berhasil";
            content = body;
            subject = `Reset password akun ${APP_NAME}`;
            isPassword = true;
            break;
        case "ANNOUNCEMENT":
            message = "Pemberitahuan";
            content = body;
            subject = `Pemberitahuan ${APP_NAME}`;
            isPassword = false;
            break;
    }

    const html = emailTemplate(name, message, content, isPassword);

    const msg = {
        from: `"${APP_NAME}" <${EMAIL}>`,
        to: target,
        subject,
        html,
    };

    try {
        await mailer.sendMail(msg);
    } catch (error) {
        console.error(error);
        return new Error("Gagal mengirim email ");
    }
};
