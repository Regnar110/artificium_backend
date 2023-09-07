"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// KLASA IMITUJĄCA STAN APLIKACJI
// MA PRZECHOWYWAC DANE, KTÓRE MOGĄ BYĆ NIEPOTRZEBNIE ŚCIĄGANE Z API KILKUROTNIE POPRZEZ ZAPOTRZEBOWANIE NA NIE W RÓZNYCH MIEJSCACH
class STATE_STORE {
    static SET_USER(new_user) {
        if (new_user !== null) {
            if (this.user === null) {
                this.user = new_user;
            }
            else {
                Object.assign(this.user, new_user);
            }
        }
        else {
            this.user = null;
        }
    }
    static RESET_STATE() {
        this.user = null;
    }
}
STATE_STORE.user = null;
exports.default = STATE_STORE;
