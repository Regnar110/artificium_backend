import { UserMongoDocument } from "../globalTypings/userMongoDocument"

// KLASA IMITUJĄCA STAN APLIKACJI
// MA PRZECHOWYWAC DANE, KTÓRE MOGĄ BYĆ NIEPOTRZEBNIE ŚCIĄGANE Z API KILKUROTNIE POPRZEZ ZAPOTRZEBOWANIE NA NIE W RÓZNYCH MIEJSCACH
class STATE_STORE {
    static user:null | UserMongoDocument = null

    static SET_USER(new_user: UserMongoDocument | null) {
        if (new_user !== null) {
          if (this.user === null) {
            this.user = new_user;
          } else {
            Object.assign(this.user, new_user);
          }
        } else {
          this.user = null;
        }
      }
    static RESET_STATE() {
      this.user = null
    }
}

export default STATE_STORE

