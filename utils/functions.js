const axios = require('axios');

module.exports.parseFormData = (formData) => {
    let params = {};

    formData.forEach(function (value, key) {
        if (params[key]) {
            if (!Array.isArray(params[key]))
                params[key] = [params[key]];

            params[key].push(value);
        } else {
            params[key] = value;
        }
    });

    return params;
};

module.exports.convertLocalToPublic = (local) => {
    if  (local) {
        let publicPath = local.replace(/\\/g, '/');
        return `${process.env.PROTOCOL}://${process.env.DOMAIN}/${publicPath}`;
    } else {
        return null;
    }
};

module.exports.merge_array = (array1, array2) => {
    let result_array = [];
    let arr = array1.length>0?array1.concat(array2):array2;
    let len = arr.length;
    let assoc = {};

    while(len--) {
        let item = parseInt(arr[len]);

        if(!assoc[item])
        {
            result_array.unshift(item);
            assoc[item] = true;
        }
    }

    return result_array;
};


module.exports.remove_from_array = (array1, array2) => {
    let result_array = null;

    for(let id = 0; id < array2.length; id += 1){
        result_array = array1.filter(el => el != array2[id]);
    }

    return result_array;
};

module.exports.sendNotification = (data) => new Promise((resolve, reject) => {
    data.notification.sound = "default";
    // const dataString = JSON.stringify(data);

    return axios.post('https://fcm.googleapis.com/fcm/send', data, {
        headers: {
            'Authorization': `key=${process.env.FCM_API_KEY}`,
            'Content-Type': 'application/json'
        }
    }).then(res => {
        resolve(res);
    }).catch(err => console.error(err) || reject(err));
});

module.exports.remove_duplicates = (arr) => {
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = true;
    }
    for (var key in obj) {
        ret_arr.push(key);
    }
    return ret_arr;
};