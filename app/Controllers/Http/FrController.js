'use strict'

var fs = require("fs");
const Helpers = use('Helpers');
const axios = require('axios').default;

var token;
var timestamp;
class FrController {

    async demography({ view }) {
        return view.render('Fr.demography')
    }

    async demographyPost({ request }) {
        var foto = request.file('webcam');
        var fotoString = await this.processFile(foto);
        await this.authNodeFlux().then(function (result) {
            token = result.data.token;
            timestamp = result.data.headers["x-nodeflux-timestamp"];
        });
        return await this.requestToNodeFlux({
            "analytics": [
                {
                    "type": "FACE_DEMOGRAPHY"
                }
            ],
            "image": {
                "encoding": "IMAGE_ENCODING_JPEG",
                "content": fotoString
            }
        });
    }

    async enrollmentPost({ request }) {
        var foto = request.file('webcam');
        var fotoString = await this.processFile(foto);
        await this.authNodeFlux().then(function (result) {
            token = result.data.token;
            timestamp = result.data.headers["x-nodeflux-timestamp"];
        });
        return await this.requestToNodeFlux({
            "analytics": [
                {
                    "type": "FACE_ENROLLMENT"
                }
            ],
            "image": {
                "encoding": "IMAGE_ENCODING_JPEG",
                "content": fotoString
            }
        });
    }

    async recognitionPost({ request }) {
        var foto = request.file('webcam');
        var fotoString = await this.processFile(foto);
        await this.authNodeFlux().then(function (result) {
            token = result.data.token;
            timestamp = result.data.headers["x-nodeflux-timestamp"];
        });
        return await this.requestToNodeFlux({
            "analytics": [
                {
                  "type": "FACE_RECOGNITION",
                  "options": {
                    "@type": "type.googleapis.com/nodeflux.analytics.v1beta1.FaceRecognitionOptions",
                    "candidateCount": 2
                    }
                }
              ],
            "image": {
                "encoding": "IMAGE_ENCODING_JPEG",
                "content": fotoString
            }
        });
    }

    async processFile(fotoFile) {
        var filename = new Date().toISOString().replace(/[^0-9]/g, "");
        await fotoFile.move(Helpers.tmpPath('uploads'), {
            name: filename + '.jpg',
        });

        var bitmap = fs.readFileSync(Helpers.tmpPath('uploads') + '/' + filename + '.jpg');
        const base_64 = new Buffer.from(bitmap).toString('base64');

        return base_64;
    }

    async authNodeFlux() {
        let response = await axios.post('https://backend.cloud.nodeflux.io/auth/signatures', {
            access_key: '5J0DLPRNO6XFE9535NE6D1YO5',
            secret_key: 'yhNmUlDSmXekgwcOwLKqWF2w6qbUAy8kr362vzv1lA7cq1R6kEHIc9dlonkj84FU'
        });
        return response;
    }

    
    async requestToNodeFlux(data) {
        let response = await axios.post('https://api.cloud.nodeflux.io/v1beta1/image-analytic/stream', data, 
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.generateKey(),
                'x-nodeflux-timestamp': timestamp
            }
        });
        // .then(function (response) {
        //     return response;
        // }).catch(function (error) {
        //     return error;
        // });
        return response.data;
    }

    generateKey() {
        return 'NODEFLUX-HMAC-SHA256 Credential=' + '5J0DLPRNO6XFE9535NE6D1YO5' + '/' + timestamp.substr(0, 8) + '/nodeflux.api.v1beta1.ImageAnalytic/StreamImageAnalytic, SignedHeaders=x-nodeflux-timestamp, Signature=' + token;
    }
}

module.exports = FrController