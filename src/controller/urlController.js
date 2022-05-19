const urlModel = require("../models/urlModel");
const { isValid, isValidReqBody, isValidURL, generateCode } = require('../validator/validation')
const { SET_ASYNC, GET_ASYNC } = require('../redis/redisConnection');

// =========================================postUrl=======================================================
const shortUrl = async function (req, res) {

    try {
        const data = req.body;
        const longUrl = data.longUrl;
        const BASE_URL = 'http://localhost:3000'

        if (!isValidReqBody(data)) {
            return res.status(400).send({ status: false, message: "Please enter longUrl!" })
        }

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "Please enter longurl valid value!" })
        }

        if (!isValidURL(longUrl)) {
            return res.status(400).send({ status: false, message: "Please enter valid longurl" })
        }

        const FoundedDataInCache = await GET_ASYNC(`${longUrl}`)
        if (FoundedDataInCache) {
            return res.status(200).send({ status: true, msg: 'From Radis', data: JSON.parse(FoundedDataInCache) })
        }

        const isPresentUrl = await urlModel.findOne({ longUrl: longUrl }).select({ __v: 0, createdAt: 0, updatedAt: 0, _id: 0 })
        if (isPresentUrl) {
            return res.status(200).send({ status: true, msg: 'From dDatabase', data: isPresentUrl });
        }

        const urlCode = generateCode(7).trim().toLowerCase();
        const shortUrl = `${BASE_URL}/${urlCode}`


        const createdData = await urlModel.create({ urlCode, longUrl, shortUrl });
        const filteredData = await urlModel.findOne(createdData).select({ __v: 0, createdAt: 0, updatedAt: 0, _id: 0 })


        await SET_ASYNC(`${filteredData.longUrl}`, JSON.stringify(filteredData))

        res.status(201).send({ status: true, data: filteredData })

    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}


// =========================================getUrl=======================================================

const getUrl = async function (req, res) {

    try {

        const urlCode = req.params.urlCode;
        if (urlCode.length != 7) {
            return res.status(400).send({ status: false, message: "Only 7 digits or letters urlCode is allowed!" });
        }

        const OriginalUrlInCache = await GET_ASYNC(`${urlCode}`);
        if (OriginalUrlInCache) {
            console.log('FromRedis')
            return res.status(302).redirect(OriginalUrlInCache);
        }

        const foundedUrl = await urlModel.findOne({ urlCode: urlCode })
        if (!foundedUrl) {
            return res.status(404).send({ status: false, message: "Url not found" })
        }

        console.log('FromDatabase')

        const OriginalUrl = foundedUrl.longUrl;

        await SET_ASYNC(`${foundedUrl.urlCode}`, foundedUrl.longUrl)

        return res.status(302).redirect(OriginalUrl)

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports = { shortUrl, getUrl }