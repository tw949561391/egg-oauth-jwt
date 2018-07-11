'use strict';

function isUrl(str) {
    if (isEmpty(str)) {
        return false;
    }
    const REG_URI = new RegExp("^((https|http)?://)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((/?)|(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$");
    return REG_URI.test(str);
}


function isEmpty(str) {
    if (str === null || str === undefined) {
        return true;
    }
    return str.length === 0;
}


module.exports = {
    isUrl: isUrl,
    isEmpty: isEmpty
};