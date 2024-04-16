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

// Crear un transportador SMTP con OAuth2
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: accountTransport.auth.user,
        clientId: accountTransport.auth.clientID,
        clientSecret: accountTransport.auth.clientSecret,
        refreshToken: accountTransport.auth.refreshToken        
    }
});

app.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;

    try {
        // Configurar detalles del correo
        const mailOptions = {
            from: accountTransport.auth.user,
            to,
            subject,
            text
        };

        // Enviar correo electrónico
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo electrónico enviado:', info.response);
        res.status(200).json({ message: 'Correo electrónico enviado correctamente' });
    } catch (error) {
        console.log('Error al enviar el correo electrónico:', error);
        res.status(500).json({ error: 'Error al enviar el correo electrónico' });
    }
});


app.post("/create_preference", (req, res) => {
    // "https://ec3.vercel.app/checkout"
    // "http://localhost:5173/checkout",
    let preference = {
        items: req.body.items,
        back_urls: {
            success: "http://localhost:5174/checkout",
            failure: "http://localhost:5174/checkout",
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
            console.log("Recibida solicitud para crear preferencia:", response.body);
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

