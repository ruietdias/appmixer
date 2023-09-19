const axios = require('axios');
module.exports = {
    receive(context) {
        let count = context.messages.in.content.count || 1;
        let text = context.messages.in.content.text;
        return axios.get('https://postman-echo.com/get?text=' + text + '&count=' + count)
            .then(response => {
                return context.sendJson({
                    mydata: 'Received from Postman echo: ' + JSON.stringify(response.data.args)
                }, 'out');
            });
    }
};
