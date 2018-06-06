'use strict';

module.exports = class MockPaymentService {

    static processCredit(payment) {
        let paymentResolution = {
            Type: payment.Type,
            CardBrand: payment.CardBrand,
            LastFourDigits: payment.CardNumber.slice(-4),
            Transaction_id: null
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                paymentResolution.Transaction_id = this.generateTransactionId()
                resolve(paymentResolution)
            }, 0);
        })
    }

    static processVirtual(payment) {
        let paymentResolution = {
            Type: payment.Type,
            Transaction_id: null
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                paymentResolution.Transaction_id = this.generateTransactionId()
                resolve(paymentResolution)
            }, 0);
        })

    }

    static generateTransactionId() {
        const date = new Date().getTime().toString()
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let id = '';
        for (let i = 0; i < 10; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        id += date
        return id;
    }





}