const express = require("express");
const bodyParser = require("body-parser");
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

var EmployeeProfileData = []
var EmployeeLeaveData = []
var EmployeeLeaveGraphData = []
var EmployeePayslipData = []
var EmployeePaySlipPDF = ""

const EmployeeProfileDetail = (req, res) => {
    const EmployeeNo = req.body.HCMID

    if (EmployeeNo == undefined || EmployeeNo == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_HCM_GETPROFILE>
          <I_PERNR>${EmployeeNo}</I_PERNR>
       </urn:ZBAPI_HCM_GETPROFILE>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_HRM_PROFILE&receiverParty=&receiverService=&interface=SI_HRM_PROFILE&interfaceNamespace=http://hrm_kaartech.com',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        EmployeeProfileData = resp.data

        xml2js.parseString(EmployeeProfileData, (err, result) => {
            if (err) {
                throw err;
            }




            // res.status(200).send(result)

            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_HCM_GETPROFILE.Response'][0]["E_PERSON"][0];
            // res.status(200).send(userResult)
            const employeeProfile = {}
            employeeProfile["EMPID"] = userResult["PERNR"][0]
            employeeProfile["OBJECT_TYPE"] = userResult["OTYPE"][0]
            employeeProfile["JOININGDATE"] = userResult["BEGDA"][0]
            employeeProfile["LEAVINGDATE"] = userResult["ENDDA"][0]
            employeeProfile["EMPLOYEE_STATUS"] = userResult["STATUS"][0]
            employeeProfile["COMPANY_CODE"] = userResult["BUKRS"][0]
            employeeProfile["PERSONNEL_AREA"] = userResult["WERKS"][0]
            employeeProfile["EMPLOYEE_GROUP"] = userResult["PERSG"][0]
            employeeProfile["EMPLOYEE_SUBGROUP"] = userResult["PERSK"][0]
            employeeProfile["CONTROLLING_AREA"] = userResult["KOKRS"][0]
            employeeProfile["ORGANIZATION_UNIT"] = userResult["ORGEH"][0]
            employeeProfile["ORGANIZATION_TEXT"] = userResult["ORGEH_TXT"][0]
            employeeProfile["DESIGNATION_UNIT"] = userResult["PLANS"][0]
            employeeProfile["EMP_DESIGNATION"] = userResult["PLANS_TXT"][0]
            employeeProfile["ADDRESS_UNIT"] = userResult["ANRED"][0]
            employeeProfile["EMPLOYEE_NAME"] = userResult["ENAME"][0]
            employeeProfile["LAST_NAME"] = userResult["NACHN"][0]
            employeeProfile["FIRST_NAME"] = userResult["VORNA"][0]
            employeeProfile["EMPLOYEE_DOB"] = userResult["GBDAT"][0]
            employeeProfile["EMPLOYEE_COUNTRY"] = userResult["NATIO"][0]
            employeeProfile["EMPLOYEE_CITY"] = userResult["ORT01"][0]
            employeeProfile["EMPLOYEE_POSTALCODE"] = userResult["PSTLZ"][0]
            employeeProfile["STREET_NAME"] = userResult["STRAS"][0]
            employeeProfile["TELEPHONE_NO"] = userResult["TELNR"][0]
            res.status(200).send(employeeProfile)


            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });

}

//leave graph details 

const EmployeeLeaveGraphDetail = (req, res) => {
    const EmployeeNo = req.body.HCMID
    const Year = req.body.Year


    if (EmployeeNo == undefined || EmployeeNo == null || Year == undefined || Year == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_HCM_LEAVEGRAPH>
          <!--You may enter the following 3 items in any order-->
          <I_PERNR>${EmployeeNo}</I_PERNR>
          <I_YEAR>${Year}</I_YEAR>
          <IT_LEAVEGRAPH>
             <!--Zero or more repetitions:-->
             <item>
               
             </item>
          </IT_LEAVEGRAPH>
       </urn:ZBAPI_HCM_LEAVEGRAPH>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_HRM_LEAVEGRAPH&receiverParty=&receiverService=&interface=SI_HRM_LEAVEGRAPH&interfaceNamespace=http://hrm_kaartech.com',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        EmployeeLeaveGraphData = resp.data

        xml2js.parseString(EmployeeLeaveGraphData, (err, result) => {
            if (err) {
                throw err;
            }




            // res.status(200).send(result)

            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_HCM_LEAVEGRAPH.Response'][0]["IT_LEAVEGRAPH"];

            if (userResult[0] != '') {
                const EmployeeLeaveGraphItemResponse = userResult[0]["item"]
                const EmployeeLeaveGraphItemArrObject = []
                EmployeeLeaveGraphItemResponse.forEach((value) => {
                    const tempObj = {}

                    tempObj["LEAVE_YEAR"] = value["ABSYEAR"][0]
                    tempObj["LEAVE_MONTH"] = value["ABSMONTH"][0]
                    tempObj["MONTH_NAME"] = value["MONNAM"][0]
                    tempObj["NO_OF_DAYS"] = value["ABSDAYS"][0]

                    EmployeeLeaveGraphItemArrObject.push(tempObj);
                })

                res.status(200).send(EmployeeLeaveGraphItemArrObject)

            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }

            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });

}

// leave  details 


const EmployeeLeaveDetail = (req, res) => {
    const EmployeeNo = req.body.HCMID
    const Year = req.body.Year
    const Month = req.body.Month

    if (EmployeeNo == undefined || EmployeeNo == null || Year == undefined || Year == null || Month == null || Month == undefined) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_HCM_CUSTLEAVE>
          <!--You may enter the following 4 items in any order-->
          <I_MONTH>${Month}</I_MONTH>
          <I_PERNR>${EmployeeNo}</I_PERNR>
          <I_YEAR>${Year}</I_YEAR>
          <IT_LEAVE>
             <!--Zero or more repetitions:-->
             <item>
                
             </item>
          </IT_LEAVE>
       </urn:ZBAPI_HCM_CUSTLEAVE>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_GLEAVE&receiverParty=&receiverService=&interface=SI_HRM_GLEAVE&interfaceNamespace=http://hrm_kaartech.com',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        EmployeeLeaveData = resp.data

        xml2js.parseString(EmployeeLeaveData, (err, result) => {
            if (err) {
                throw err;
            }






            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_HCM_CUSTLEAVE.Response'][0]["IT_LEAVE"];
            if (userResult[0] != '') {
                const EmployeeLeaveItemResponse = userResult[0]["item"]
                const EmployeeLeaveItemArrObject = []
                EmployeeLeaveItemResponse.forEach((value) => {
                    const tempObj = {}


                    tempObj["EMPLOYEE_ID"] = value["PERNR"][0]
                    tempObj["LEAVE_START_DATE"] = value["BEGDAT"][0]
                    tempObj["LEAVE_END_DATE"] = value["ENDDAT"][0]
                    tempObj["NO_OF_DAYS_LEAVE"] = value["ABSDAYS"][0]
                    tempObj["LEAVE_REASON"] = value["REASON"][0]
                    tempObj["LEAVE_YEAR"] = value["ABSYEAR"][0]
                    tempObj["LEAVE_MONTH"] = value["ABSMONTH"][0]
                    tempObj["LEAVE_TYPE"] = value["ABSENCETYPE"][0]
                    tempObj["LEAVE_TYPE_TEXT"] = value["ABSENCETYPTXT"][0]

                    EmployeeLeaveItemArrObject.push(tempObj);
                })

                res.status(200).send(EmployeeLeaveItemArrObject)

            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }

            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });

}




// const payslip 

const Payslip = (req, res) => {
    const EmployeeNo = req.body.HCMID


    if (EmployeeNo == undefined || EmployeeNo == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_HCM_PAYSLIP>
          <!--You may enter the following 2 items in any order-->
          <I_PERNR>${EmployeeNo}</I_PERNR>
          <P_FORM>
            
             <item>
 
             </item>
          </P_FORM>
       </urn:ZBAPI_HCM_PAYSLIP>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_HRM_PAYSLIP&receiverParty=&receiverService=&interface=SI_HRM_PAYSLIP&interfaceNamespace=http://hrm_kaartech.com',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        EmployeePayslipData = resp.data

        xml2js.parseString(EmployeePayslipData, (err, result) => {
            if (err) {
                throw err;
            }






            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_HCM_PAYSLIP.Response'][0]["P_FORM"];
            if (userResult[0] != '') {
                const EmployeePayslipItemResponse = userResult[0]["item"]
                const EmployeePayslipItemArrObject = []
                EmployeePayslipItemResponse.forEach((value) => {
                    const tempObj = {}


                    tempObj["LINE"] = value["LINDA"][0]

                    EmployeePayslipItemArrObject.push(tempObj);
                })

                res.status(200).send(EmployeePayslipItemArrObject)

            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }

            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });

}



const PayslipPDF = (req, res) => {
    const EmployeeNo = req.body.HCMID


    if (EmployeeNo == undefined || EmployeeNo == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_HCM_PAYSLIPHTML>
          <I_PERNR>${EmployeeNo}</I_PERNR>
       </urn:ZBAPI_HCM_PAYSLIPHTML>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_HRM_PAYSLIP_HTML&receiverParty=&receiverService=&interface=SI_HRM_PAYSLIP_HTML&interfaceNamespace=http://hrm_kaartech.com',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        EmployeePaySlipPDF = resp.data

        xml2js.parseString(EmployeePaySlipPDF, (err, result) => {
            if (err) {
                throw err;
            }






            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_HCM_PAYSLIPHTML.Response'][0]["BASE64"];

            // log JSON string
            res.status(200).send(userResult)

        });





    }).catch(err => { console.log(err) });

}



module.exports = { EmployeeProfileDetail, EmployeeLeaveDetail, EmployeeLeaveGraphDetail, Payslip, PayslipPDF }