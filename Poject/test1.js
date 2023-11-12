const axios = require('axios');

const key = "jiOmJfJl1DuS3wgn5gO+iklZUufTTr9upGZyPm2fHmlqVIuj0pUuUa7ixsTrQK1asGso3S73YM6bx49f2bnFbg==";
const url = "https://api.odcloud.kr/api/15004317/v1/uddi:a27dc8f0-26b8-42ca-8f4c-c33da26e51a1_201909202206";

const queryParams = {
    serviceKey: key,
    page: '1',
    perPage: '1000',
    returnType: 'JSON',
};

axios.get(url, { params: queryParams })
    .then(response => {
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Body:', response.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
