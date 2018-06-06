'use strict';

class DeliveryDatesHandler {

    static getFullDate(date) {
        let startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0)
        return startOfDay
    }

    static getNextDayFullDate(date) {
        let startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0)
        let nextDay = new Date(startOfDay)
        nextDay.setDate(nextDay.getDate() + 1)
        return nextDay
    }

    static formatDate(date) {
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    }

    static sortDeliveryDates(deliveryDates) {
        const maxOrdersPerDay = 3;
        const unavailableDates = []
        let currentDate;
        let numOfOrders;

        for (let i = 0; i < deliveryDates.length; i++) {
            currentDate = deliveryDates[i]._id
            numOfOrders = deliveryDates[i].Count
            if (numOfOrders >= maxOrdersPerDay) unavailableDates.push(new Date(currentDate))
        }
        let earliestAvailableDate = this.getEarliestAvailableDate(unavailableDates);

        let sortedDates = {
            unavailable: unavailableDates.map(date => this.formatDate(date)),
            earliestAvailable: this.formatDate(earliestAvailableDate)
        }
        return sortedDates
    }

    static getEarliestAvailableDate(unavailableDates) {
        // sort unavailable dates from earliest to latest
        // then return the earliest date thats not in the unavailable dates array
        unavailableDates = unavailableDates.sort((a, b) => a - b)
        let earliest = this.getFullDate(Date.now())

        for (let i = 0; i < unavailableDates.length; i++) {
            if (unavailableDates[i].getDate() == earliest.getDate()) {
                earliest = this.getNextDayFullDate(earliest);
            } else {
                break;
            }
        }
        return earliest
    }
}

module.exports = DeliveryDatesHandler;