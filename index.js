const express = require("express");
const app = express();
const cors = require("cors");
const mercadopago = require("mercadopago");
require("dotenv").config();


const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const accountTransport = require('./account_transport.json');

mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send('Todo ok!! soy tu backend!');
});


const mail_rover = async (callback) => {

    // Definir ruta para enviar correos electrónicos
    // Crear un objeto OAuth2 con los datos de la cuenta de transporte
    const oauth2Client = new OAuth2(
        accountTransport.auth.clientId,
        accountTransport.auth.clientSecret,
        "https://developers.google.com/oauthplayground", // Redirect URL
    );

    // Configurar credenciales de acceso
    oauth2Client.setCredentials({
        refresh_token: accountTransport.auth.refreshToken,
        tls: {
            rejectUnauthorized: false
        }
    });

    // Obtener un nuevo token de acceso
    oauth2Client.getAccessToken((err, token) => {

        if (err) {
            return console.log('Error al obtener token de acceso:', err);;
        }
        accountTransport.auth.accessToken = token;
        callback(nodemailer.createTransport(accountTransport));
    })
}


// Crear un transportador SMTP con OAuth2
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         type: "OAuth2",
//         user: accountTransport.auth.user,
//         clientId: accountTransport.auth.clientId,
//         clientSecret: accountTransport.auth.clientSecret,
//         refreshToken: accountTransport.auth.refreshToken
//     }
// });
function send(idAplicativo, to, text, subject, callback) {
    var id = 0;
    let _ID_APP_1;
    try {
        var id = parseInt(idAplicativo);
    } catch (error) {
        console.log(`error parse idAplicativo feedback.js ${error}`)
    }
    mail_rover(function (emailTransporter) {
        let json = {};
        switch (id) {
            case _ID_APP_1:
                json = {
                    mail: emailTransporter, app: 'CHECK', from: 'eCommerce <info@ecommerce.com>',
                    to,
                    subject,
                    text
                };
                break;
            default:
                json = {
                    mail: emailTransporter, app: 'CHECK', from: 'eCommerce <info@ecommerce.com>',
                    to,
                    subject,
                    text
                };
                break;
        }
        callback(json);
    });
}

app.post('/send-email-register', async (req, res) => {
    const { idAplicativo, to, text, subject } = req.body;

    send(idAplicativo, to, text, subject, function (json) {
        const { mail, to, subject, text } = json;

        const mailOptions = {
            to,
            subject,
            html: `
                <p>BIENVENID@</p>
                <p></p>
                <!-- Aca podes poner lo que quieras -->
                <p>${text}</p>
                `
        };

        mail.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Error al enviar correo electrónico:', err);
                res.status(500).json({ error: 'Error al enviar correo electrónico' });
            } else {
                console.log('Correo electrónico enviado:', info.response);
                res.json({ message: 'Correo electrónico enviado' });
            }
        });
    });
});

app.post('/send-email-checkout', async (req, res) => {
    const { idAplicativo, to, subject, text } = req.body;

    send(idAplicativo, to, subject,text, function (json) {
        const { mail, to, subject, text } = json;

        const mailOptions = {
            to,
            subject,
            html: `
                <p>Atento, tuviste una venta</p>
                <p></p>
                <!-- Aca podes poner lo que quieras -->
                <p>${text}</p>
                `
        };

        mail.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Error al enviar correo electrónico:', err);
                res.status(500).json({ error: 'Error al enviar correo electrónico' });
            } else {
                console.log('Correo electrónico enviado:', info.response);
                res.json({ message: 'Correo electrónico enviado' });
            }
        });
    });
});

app.post('/send-email-checkout-user', async (req, res) => {
    const { idAplicativo, to, subject, text } = req.body;

    send(idAplicativo, to, subject, text, function (json) {
        const { mail, to, subject, text } = json;

        const mailOptions = {
            to,
            subject,
            html: `
                <p>Gracias por tu compra</p>
                <p></p>
                <!-- Aca podes poner lo que quieras -->
                <p>${text}</p>
                `
        };

        mail.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Error al enviar correo electrónico:', err);
                res.status(500).json({ error: 'Error al enviar correo electrónico' });
            } else {
                console.log('Correo electrónico enviado:', info.response);
                res.json({ message: 'Correo electrónico enviado' });
            }
        });
    });
});

app.post("/create_preference", (req, res) => {
    // "https://ec3.vercel.app/checkout"
    // "http://localhost:5173/checkout",
    let preference = {
        items: req.body.items,
        back_urls: {
            success: "http://localhost:5173/checkout",
            failure: "http://localhost:5173/checkout",
            pending: ""
        },
        auto_return: "approved",
        shipments: {
            cost: req.body.shipment_cost,
            mode: "not_specified"
        },
    };
    console.log("Recibida solicitud para crear preferencia:", req.body);
    mercadopago.preferences
        .create(preference)
        .then(function (response) {
            // console.log("Recibida solicitud para crear preferencia:", response.body);
            res.json({ id: response.body.id });
        })
        .catch(function (error) {
            console.log("Error al crear preferencia en MercadoPago:", error);
            res.status(500).json({ error: 'Error al crear la preferencia en MercadoPago' });
        });
});

app.listen(8081, () => {
    console.log('Server running on port 8081');
});

