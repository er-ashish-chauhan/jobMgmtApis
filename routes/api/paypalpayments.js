const express = require("express");
const router = express.Router();

const braintree = require("braintree");

// const gateway = new braintree.BraintreeGateway({
//     environment: braintree.Environment.Sandbox,
//     merchantId: "ypkk2s4s4njhg9qy",
//     publicKey: "bwyc5jhxzgnrydnz",
//     privateKey: "1119a6c9fdc181b129993e41ac68c705"
// });

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: "kc9tcryhgcxfnnhj",
    publicKey: "39knnftgp3rmsp4z",
    privateKey: "d6073d6763f3188204df6030d47a47e8"
});

router.get(
    "/getClientToken",
    async (req, res) => {

        try {
            gateway.clientToken.generate({}).then(response => {
                const result = {
                    status: res.statusCode,
                    data: {
                        clientToken: response.clientToken
                    }
                }
                res.json(result)
                // res.send(response.clientToken);
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

router.post(
    "/checkout",
    async (req, res) => {
        const { nonce, clientToken, deviceData, amount } = req.body;
        try {
            gateway.transaction.sale({
                amount: amount,
                paymentMethodNonce: nonce,
                deviceData: deviceData,
                options: {
                    submitForSettlement: true
                }
            }, (err, result) => {
                console.log(err, result);

                const response = {
                    status: res.statusCode,
                    data: {
                        success: result,
                        error: err
                    }
                }
                res.json(response);
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

module.exports = router;