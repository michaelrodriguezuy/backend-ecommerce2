const express = require("express");
const app = express();
const cors = require("cors");
const mercadopago = require("mercadopago");
require("dotenv").config();

mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send('Todo ok!! soy tu backend');
});

app.post("/create_preference", (req, res) => {
    // "https://ec3.vercel.app/checkout"
    // "http://localhost:5173/checkout",
    let preference = {
        items: req.body.items,
        back_urls: {
            success: "https://ec3.vercel.app/checkout",
            failure: "https://ec3.vercel.app/checkout",
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

