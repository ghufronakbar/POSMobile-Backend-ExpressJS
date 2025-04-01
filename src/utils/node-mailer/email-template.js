import { APP_NAME, EMAIL } from "../../constant/index.js";

export const emailTemplate = (name, subject, content, isPassword) =>
    `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="./icon.png">
    <title>${APP_NAME}</title>
    <style>
        body {
            font-family: sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
            -ms-text-size-adjust: none;
        }

        .container {
            width: 100%;
            background-color: #f4f4f7;
            padding: 40px 0;
            text-align: center;
        }

        .email-content {
            background-color: #ffffff;
            margin: 0 auto;
            padding: 20px;
            max-width: 700px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .email-header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }

        .email-header img {
            margin-top: 10px;
            width: 200px;
            vertical-align: middle;
        }

        .email-body h1 {
            font-size: 26px;
            color: #000000;
        }

        .email-body p {
            font-size: 16px;
            color: #000000;
            line-height: 1.5;
            margin: 10px;
            line-height: 1.5;
        }

        .email-body .confirm-btn {
            display: inline-block;
            background-color: #23ACE3;
            color: #ffffff;
            margin-top: 10px;
            padding: 12px 25px;
            font-size: 16px;
            border-radius: 5px;
            text-decoration: none;
        }

        .password-text {
            font-size: 32px;
            font-weight: bold;
            background-color: #23ACE3;
            padding: 10px;
            color: #FFFFFF;
            border-radius: 5px;
            margin-top: 15px;
            display: inline-block;
            letter-spacing: 0.8rem;
        }

        .email-footer {
            margin-top: 30px;
            text-align: center;
            color: #888888;
            font-size: 12px;
        }

        .email-footer a {
            color: #23ACE3;
            text-decoration: underline;
        }

        @media only screen and (max-width: 800px) {
            .email-content {
                width: 85%;
                padding: 15px;
                box-shadow: none;
                border-radius: 5px;
            }
            .password-text {
                font-size: 27px;
                align-items: center;
                text-align: center;
                margin-top: 0;
                font-weight: bold;
                letter-spacing: 0.6rem;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="email-content">
            <div class="email-header">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/McDonald%27s_logo.svg/800px-McDonald%27s_logo.svg.png" alt="${APP_NAME}">
            </div>
            <div class="email-body">
                <h1>Halo ${name}!</h1>
                <div class="email-text">
                    <p>Terima kasih telah menggunakan layanan <strong>${APP_NAME?.toUpperCase()}</strong></p>
                    <p>${subject}</p>
                </div>
                ${isPassword
        ? `<div class="password-text">${content}</div>`
        : `<div class="confirm-btn">${content}</div>`
    }


            </div>

            <div class="email-footer">
                <p>Jika anda punya pertanyaan, silahkan                    
                    email ke
                    <a href="mailto:${EMAIL}">${EMAIL}</a>
                </p>
                <p>Sleman, Yogyakarta, Indonesia</p>
            </div>
        </div>
    </div>
</body>

</html>
`;
