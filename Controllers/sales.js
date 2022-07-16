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




var InquiryData = []
var SalesOrderData = []
var InvoiceData = []


// Getting Invoice Detail Function : 
//    Input : KUNNR = Customer No
//    Output : IT_INQUIRY = INQUIRY Data Array

const Inquiry = (req, res) => {

    const custNo = req.body.custNo
    if (custNo == undefined || custNo == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }



    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_FICO_INQUIRY_GETLIST>
          <!--You may enter the following 2 items in any order-->
          <I_KUNNR>${custNo}</I_KUNNR>
          <IT_INQUIRY>
             <!--Zero or more repetitions:-->
             <item>
               
             </item>
          </IT_INQUIRY>
       </urn:ZBAPI_FICO_INQUIRY_GETLIST>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_FICO_INQUIRY_GETLIST&receiverParty=&receiverService=&interface=SI_FICO_INQUIRY_GETLIST&interfaceNamespace=http://crm_kaartech_shyam.com',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        InquiryData = resp.data


        xml2js.parseString(InquiryData, (err, result) => {
            if (err) {
                throw err;
            }

            const inquiryResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_INQUIRY_GETLIST.Response'][0]["IT_INQUIRY"];
            if (inquiryResult[0] != '') {
                const inquiryResponse = inquiryResult[0]["item"]
                const inquiryArrObject = []
                inquiryResponse.forEach((value) => {
                    const tempObj = {}
                    tempObj["VBELN"] = value["VBELN"][0]
                    tempObj["ERDAT"] = value["ERDAT"][0]
                    tempObj["ERNAM"] = value["ERNAM"][0]
                    tempObj["ANGDT"] = value["ANGDT"][0]
                    tempObj["BNDDT"] = value["BNDDT"][0]
                    tempObj["AUDAT"] = value["AUDAT"][0]
                    tempObj["GUEBG"] = value["GUEBG"][0]
                    tempObj["GUEEN"] = value["GUEEN"][0]
                    tempObj["VDATU"] = value["VDATU"][0]
                    tempObj["AUTLF"] = value["AUTLF"][0]
                    inquiryArrObject.push(tempObj);
                })


                res.status(200).send(inquiryArrObject);
            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }



        });





    }).catch(err => { console.log(err) });



}


// Getting Overall Sales Order Detail Function : 
//    Input : KUNNR = Customer No,
//            VKORG = SalesOrganizationNo   

//    Output : IT_SALESORDER = SALES ORDER Data Array

const SalesOrder = (req, res) => {

    const custNo = req.body.custNo
    const saleOrg = req.body.saleOrg
    if (custNo == undefined || saleOrg == undefined || custNo == null || saleOrg == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }



    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_FICO_SALESORDER>
          <!--You may enter the following 3 items in any order-->
          <KUNNR>${custNo}</KUNNR>
          <SALESORG>${saleOrg}</SALESORG>
          <ITAB_SALEORDER>
          
          </ITAB_SALEORDER>
       </urn:ZBAPI_FICO_SALESORDER>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_FICO_SALESORDER&receiverParty=&receiverService=&interface=SI_FICO_SALESORDER&interfaceNamespace=http://crm_kaartech_shyam.com',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        SalesOrderData = resp.data


        xml2js.parseString(SalesOrderData, (err, result) => {
            if (err) {
                throw err;
            }

            const salesOrderResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_SALESORDER.Response'][0]["ITAB_SALEORDER"];
            if (salesOrderResult[0] != '') {
                const salesOrderResponse = salesOrderResult[0]["item"]
                const salesOrderArrObject = []
                salesOrderResponse.forEach((value) => {
                    const tempObj = {}
                    tempObj["SALESDOCNO"] = value["SD_DOC"][0]
                    tempObj["ITEMNO"] = value["ITM_NUMBER"][0]
                    tempObj["MATERIALNO"] = value["MATERIAL"][0]
                    tempObj["MATERIALNAME"] = value["SHORT_TEXT"][0]
                    tempObj["DOCUMENTTYPE"] = value["DOC_TYPE"][0]
                    tempObj["DOCUMENTDATE"] = value["DOC_DATE"][0]
                    tempObj["REQUIREDQUANTITY"] = value["REQ_QTY"][0]
                    tempObj["REQUESTEDDELIVERYDATE"] = value["REQ_DATE"][0]
                    tempObj["PURCHASEORDERNO"] = value["PURCH_NO"][0]
                    tempObj["SOLDPARTYNO"] = value["SOLD_TO"][0]
                    tempObj["CUSTOMERNAME"] = value["NAME"][0]
                    tempObj["EXCHANGERATE"] = value["EXCHG_RATE"][0]
                    tempObj["DELIVERYQUANTITY"] = value["DLV_QTY"][0]
                    tempObj["NETPRICE"] = value["NET_PRICE"][0]
                    tempObj["NETVALUE"] = value["NET_VALUE"][0]
                    tempObj["STATUS"] = value["DOC_STATUS"][0]
                    tempObj["SHIPPOINT"] = value["SHIP_POINT"][0]
                    tempObj["DISTRIBUTEDCHANNEL"] = value["DISTR_CHAN"][0]
                    tempObj["GOODSISSUEDATE"] = value["GI_DATE"][0]
                    tempObj["CURRENCY"] = value["CURRENCY"][0]

                    salesOrderArrObject.push(tempObj)


                })



                res.status(200).send(salesOrderArrObject);

            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }



        });





    }).catch(err => { console.log(err) });



}

// Getting Invoice Detail Function : 
//    Input : Vbeln = SalesOrderNo 
//    Output : IT_INVOICE = InvoiceData Array

const Invoice = (req, res) => {

    const SalesOrderNo = req.body.SalesOrderNo

    if (SalesOrderNo == undefined || SalesOrderNo == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }



    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_FICO_INVOICE_GETDETAIL>
          <!--You may enter the following 2 items in any order-->
          <I_VBELN>${SalesOrderNo}</I_VBELN>
          <IT_INVOICE>
             <!--Zero or more repetitions:-->
             <item>
               
             </item>
          </IT_INVOICE>
       </urn:ZBAPI_FICO_INVOICE_GETDETAIL>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_FICO_INVOICE&receiverParty=&receiverService=&interface=SI_FICO_INVOICE&interfaceNamespace=http://crm_kaartech_shyam.com',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        InvoiceData = resp.data


        xml2js.parseString(InvoiceData, (err, result) => {
            if (err) {
                throw err;
            }

            const InvoiceResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_INVOICE_GETDETAIL.Response'][0]["IT_INVOICE"];
            if (InvoiceResult[0] != '') {
                const InvoiceResponse = InvoiceResult[0]["item"]
                const invoiceObjectArr = []
                console.log(InvoiceResponse);
                InvoiceResponse.forEach((invoice) => {
                    const tempObj = {}
                    tempObj["COMPANYCODE"] = invoice["BUKRS"][0]
                    tempObj["ACCOUNTDOCNO"] = invoice["BELNR"][0]
                    tempObj["FISCALYEAR"] = invoice["GJHAR"][0]
                    tempObj["LINEITEMCOUNT"] = invoice["BUZEI"][0]
                    tempObj["CRDBINDICATOR"] = invoice["SHKZG"][0]
                    tempObj["LOCALCURRENCYAMOUNT"] = invoice["DMBTR"][0]
                    tempObj["DOCCURRENCYAMOUNT"] = invoice["WRBTR"][0]
                    tempObj["LEDGERAMOUNT"] = invoice["PSWBT"][0]
                    tempObj["CURRENCYTYPE"] = invoice["PSWSL"][0]
                    tempObj["SALESDOCNO"] = invoice["VBEL2"][0]
                    tempObj["CUSTOMERNO"] = invoice["KUNNR"][0]
                    tempObj["BASELINEDATE"] = invoice["ZFBDT"][0]
                    tempObj["LASTDATE"] = invoice["MADAT"][0]
                    tempObj["INSURANCEDATE"] = invoice["VRSDT"][0]
                    tempObj["AGING"] = paymentAging(invoice["MADAT"][0])

                    invoiceObjectArr.push(tempObj);
                })



                res.status(200).send(invoiceObjectArr);

            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }





        });





    }).catch(err => { console.log(err) });



}

function paymentAging(dt2) {

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    //console.log("today is" + today)





    if (dt2 == "0000-00-00" || dt2 == "") {
        // console.log("not date")
        return "";
    }
    // dt1 = "2022-06-01"
    // dt2 = "2022-07-09"

    dt2 = dt2.split("-")

    dt2.reverse()

    dt2 = dt2[1] + "/" + dt2[0] + "/" + dt2[2]
    let dt1 = today




    const date1 = new Date(dt1);
    const date2 = new Date(dt2);

    // One day in milliseconds
    const oneDay = 1000 * 60 * 60 * 24;

    // Calculating the time difference between two dates
    const diffInTime = date2.getTime() - date1.getTime();

    // Calculating the no. of days between two dates
    const diffInDays = Math.round(diffInTime / oneDay);

    //console.log("diff days " + diffInDays)
    return diffInDays


}


module.exports = { Inquiry, SalesOrder, Invoice };