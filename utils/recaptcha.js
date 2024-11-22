const Recaptcha = require('recaptcha-v2').Recaptcha;

module.exports.verifyRecaptcha = (recaptchaData) => new Promise((resolve, reject) => {
    if (process.env.RECAPTCHA_SKIP_ENABLED === 'true') { // For development purpose only, you need to add SKIP_ENABLED in .env
        const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SERVER_KEY, recaptchaData);
     
        recaptcha.verify((success, error_code) => {
            console.log(error_code)
            if (success) {
                return resolve(true);
            }
     
            return reject(false);
        });
    }else {
        return resolve(true);
    }
});
