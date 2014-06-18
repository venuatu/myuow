var key = new Buffer(require('./config').key, 'base64'),
    crypto = require('crypto'),
    alg = 'aes-256-cbc';

// https://gist.github.com/csanz/1181250
function encrypt(text){
    var cipher = crypto.createCipher(alg, key)
    var crypted = cipher.update(text,'utf8','base64')
    crypted += cipher.final('base64');
    return crypted;
}
 
function decrypt(text){
    var decipher = crypto.createDecipher(alg, key)
    var dec = decipher.update(text,'base64','utf8')
    dec += decipher.final('utf8');
    return dec;
}

module.exports = {
    decrypt: function (session) {
        var output;
        try {
            output = JSON.parse(decrypt(session));
        } catch (e) {
            return null;
        }
        return output;
    },
    encrypt: function (data) {
        return encrypt(JSON.stringify(data));
    }
};
