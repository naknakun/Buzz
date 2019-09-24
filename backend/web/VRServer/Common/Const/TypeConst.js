const resType = Object.freeze(
    {
        "error" : -1,
        "DialogUnFinish" : 0,
        "DialogFinish" : 1
    }
);
exports.resType = resType;

const StateType = Object.freeze(
    {
        "Reservation" : 0,
        "ReservationCancel" : 1,
        "ReservationFinish" : 2
    }
);
exports.StateType = StateType;