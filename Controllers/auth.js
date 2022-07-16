const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken")
const cors = require("cors");
const base64 = require('base-64')
const xml2js = require('xml2js')
const axios = require('axios')
const config = require("../config");




const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ extended: false }));
app.use(cors());

app.use((req, res, next) => {
    res.header("Access-control-allow-Origin", "*");
    res.header("Access-control-allow-Headers", "*");
    next();
});




var LoginData = []
var VendorLoginData = []
var EmployeeLoginData = []

const CustomerLogin = (req, res) => {

    const userid = req.body.custid
    const password = req.body.password


    if (userid == undefined || password == undefined || userid == null || password == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_FICO_LOGIN>
          
          <I_PASSKEY>${password}</I_PASSKEY>
        
          <I_USERID>${userid}</I_USERID> 
          
          <IT_USER> 

          </IT_USER>
       </urn:ZBAPI_FICO_LOGIN>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_FICO_LOGIN&receiverParty=&receiverService=&interface=SI_FICO_LOGIN&interfaceNamespace=http://crm_kaartech_shyam.com',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        LoginData = resp.data


        xml2js.parseString(LoginData, (err, result) => {
            if (err) {
                throw err;
            }





            //const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_LOGIN.Response'][0]["IT_USER"][0]["item"][0];
            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_LOGIN.Response'][0]["IT_USER"];
            if (userResult[0] != '') {
                const userResponse = userResult[0]["item"][0]
                const userObject = {
                    "KUNNR": userResponse["KUNNR"][0],
                    "USNAM": userResponse["USNAM"][0],
                    "PASSKEY": userResponse["PASSKEY"][0],
                    "DESIGNATION": userResponse["DESIGNATION"][0],
                    "SALEORG": userResponse["SALEORG"][0]
                }
                const userToken = TokenGenerator(userObject);
                userObject["TOKEN"] = userToken

                res.status(200).send(userObject);
            } else {
                res.status(404).send({ "Message": "unauthorized", "ErrCode": "101" })
            }

            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });



}

// VENDOR PORTAL LOGIN 

const VendorLogin = (req, res) => {

    const userid = req.body.VendorID
    const password = req.body.password


    if (userid == undefined || password == undefined || userid == null || password == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_MM_LOGIN>
          <!--You may enter the following 3 items in any order-->
          <I_PASSKEY>${password}</I_PASSKEY>
          <I_VENDID>${userid}</I_VENDID>
          <IT_USER>
             <!--Zero or more repetitions:-->
             <item>
                <!--Optional:-->
               
             </item>
          </IT_USER>
       </urn:ZBAPI_MM_LOGIN>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MM_LOGIN&receiverParty=&receiverService=&interface=SI_MM_LOGIN&interfaceNamespace=http://vrm_kaartech_shyam',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        VendorLoginData = resp.data

        xml2js.parseString(VendorLoginData, (err, result) => {
            if (err) {
                throw err;
            }


            const UserReturn = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_MM_LOGIN.Response'][0]["RETURN"][0];
            if (UserReturn["TYPE"][0] == 'E') {
                res.status(404).send({ "Message": "unauthorized", "ErrCode": "101" });
                return;
            }


            //res.status(200).send(result)
            //const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_LOGIN.Response'][0]["IT_USER"][0]["item"][0];
            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_MM_LOGIN.Response'][0]["IT_USER"];

            if (userResult[0] != '') {
                const userResponse = userResult[0]["item"][1]
                const userObject = {
                    "LIFNR": userResponse["LIFNR"][0],
                    "PASSWORD": userResponse["PASSWORD"][0],
                    "COUNTRY": userResponse["LAND1"][0],
                    "NAME": userResponse["NAME1"][0],
                    "ORGNAME": userResponse["NAME2"][0],
                    "CITY": userResponse["ORT01"][0],
                    "POSTALCODE": userResponse["PSTLZ"][0],
                    "STREET": userResponse["STRAS"][0]
                }
                const userToken = TokenGenerator(userObject);
                userObject["TOKEN"] = userToken

                res.status(200).send(userObject);
            } else {
                res.status(404).send({ "Message": "unauthorized", "ErrCode": "101" })
            }

            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });








}


// HCM PORTAL LOGIN 

const HCMLogin = (req, res) => {

    const userid = req.body.HCMID
    const password = req.body.password


    if (userid == undefined || password == undefined || userid == null || password == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:ZBAPI_HCM_LOGIN>
      <!--You may enter the following 2 items in any order-->
      <I_PASSKEY>${password}</I_PASSKEY>
      <I_PERNR>${userid}</I_PERNR>
   </urn:ZBAPI_HCM_LOGIN>
</soapenv:Body>
</soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_HRM_LOGIN&receiverParty=&receiverService=&interface=SI_HRM_LOGIN&interfaceNamespace=http://hrm_kaartech.com',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        EmployeeLoginData = resp.data

        xml2js.parseString(EmployeeLoginData, (err, result) => {
            if (err) {
                throw err;
            }




            const UserReturn = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_HCM_LOGIN.Response'][0]["RETURN"][0];
            if (UserReturn["TYPE"][0] == 'E') {
                res.status(404).send({ "Message": "unauthorized", "ErrCode": "101" });
                return;
            } else if (UserReturn["TYPE"][0] == 'S') {
                const userObject = {
                    "USERID": userid,
                    "PASSWORD": password
                }
                const userToken = TokenGenerator(userObject);
                userObject["TOKEN"] = userToken
                userObject["MESSAGE"] = "Authorized User. Successful login"

                res.status(200).send(userObject);
                return;
            } else {
                res.status(404).send({ "Message": "unauthorized", "ErrCode": "101" });
                return;
            }


        }); // xml2js parser end 





    }).catch(err => { console.log(err) });



}




const GetToken = (req, res) => {
    const payload = req.body
    if (payload == undefined || payload == null) {
        res.status(400).send({ "error": "No input value or field with null or undefined", "errCode": "100" })
    }

    const accessToken = jwt.sign(payload, config.JWTSECRETKEY, { expiresIn: 60 * 60 });
    res.status(200).send(accessToken)
}

const GetPayload = (req, res) => {

    const token = req.body.token
    if (token == undefined || token == null) {
        res.status(400).send({ "error": "No input value or field with null or undefined", "errCode": "100" })
    }
    jwt.verify(token, config.JWTSECRETKEY, function(err, decoded) {
        if (err) {

            res.status(400).send(err)
        } else {
            res.status(200).send(decoded)
        }
    });
}

const TokenAuthentication = (req, res, next) => {
    if (!req.headers.authorization) {
        console.log("1")
        return res.status(401).send("unauthorized request");
    }

    let token = req.headers.authorization.split(' ')[1];
    console.log(token)
    if (token === 'null') {
        console.log("2")
        return res.status(401).send("unauthorized request");
    }
    let payload = jwt.verify(token, config.JWTSECRETKEY);
    console.log(payload)

    if (!payload) {
        console.log(3)
        return res.status(401).send("unauthorized request");
    }
    req.userid = payload.subject;
    console.log("sucess auth")
    next();


}

const checkBarrerToken = (req, res) => {
    res.status(200).send({ "message": "true" });
}


function TokenGenerator(payload) {
    const accessToken = jwt.sign(payload, config.JWTSECRETKEY, { expiresIn: 60 * 60 });
    return accessToken;
}



module.exports = { CustomerLogin, VendorLogin, GetToken, GetPayload, TokenAuthentication, checkBarrerToken, HCMLogin };