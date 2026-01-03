import otpGenerator from 'otp-generator';
/**A Utils class for common utility functions */

class Utils {
    /**
     * @returns {String} random one-time password
     */
    static generateOtp() {
        return otpGenerator?.generate(6, {
            specialChars: false,
            lowerCaseAlphabets:false,
            upperCaseAlphabets:false,
            digits: true,
        });
    }

}

export default Utils;
