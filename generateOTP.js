class OTP_generator {
    constructor() {
      this.storage = new Map();
    }
  
    set(email, otp, duration = 1000 * 60 * 5) {
      this.storage.set(email, otp);
      setTimeout(() => this.storage.delete(email), duration);
    }
  
    verify(email, otp) {
      return this.storage.get(email) === Number(otp);
    }
  
    delete(email) {
      this.storage.delete(email);
    }
  
    getAll() {
      return this.storage;
    }
  }
  
  module.exports = new OTP_generator();
  