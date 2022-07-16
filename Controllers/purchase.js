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

var RFQData = []
var PurchaseOrderData = []
var PurchaseOrderDetailData = []
var PurchaseOrderHistoryData = []
var GoodsRecieptData = []
var InvoiceData = []

const RFQ = (req, res) => {
    const VendorID = req.body.VendorID

    if (VendorID == undefined || VendorID == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_MM_RFQ_GETLIST>
          <!--You may enter the following 2 items in any order-->
          <I_VENDORID>${VendorID}</I_VENDORID>
          <IT_RFQ>
             <!--Zero or more repetitions:-->
             <item>
                
             </item>
          </IT_RFQ>
       </urn:ZBAPI_MM_RFQ_GETLIST>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MM_RFQ&receiverParty=&receiverService=&interface=SI_MM_RFQLIST&interfaceNamespace=http://vrm_kaartech_shyam',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        RFQData = resp.data

        xml2js.parseString(RFQData, (err, result) => {
            if (err) {
                throw err;
            }




            //res.status(200).send(result)
            //const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_LOGIN.Response'][0]["IT_USER"][0]["item"][0];
            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_MM_RFQ_GETLIST.Response'][0]["IT_RFQ"];

            if (userResult[0] != '') {
                const RFQResponse = userResult[0]["item"]
                const RFQArrObject = []
                RFQResponse.forEach((value) => {
                    const tempObj = {}
                    tempObj["PURCHASE_ORDER_NO"] = value["EBELN"][0]
                    tempObj["COMPANY_CODE"] = value["BUKRS"][0]
                    tempObj["PURCHASE_DOC_CATAGORY"] = value["BSTYP"][0]
                    tempObj["PURCHASE_DOC_TYPE"] = value["BSART"][0]
                    tempObj["STATUS"] = value["STATU"][0]
                    tempObj["PURCHASE_ORDER_CREATED_DATE"] = value["AEDAT"][0]
                    tempObj["VENDOR_NO"] = value["LIFNR"][0]
                    tempObj["CUSTOMER_NO"] = value["KUNNR"][0]
                    tempObj["PURCHASE_ORGANISATION"] = value["EKORG"][0]
                    tempObj["PURCHASE_GROUP"] = value["EKGRP"][0]
                    tempObj["PURCHASE_DOC_DATE"] = value["BEDAT"][0]
                    tempObj["BID_LAST_DATE"] = value["ANGDT"][0]

                    RFQArrObject.push(tempObj);
                })

                res.status(200).send(RFQArrObject)

            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }

            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });

}

const PurchaseOrderList = (req, res) => {
    const VendorID = req.body.VendorID

    if (VendorID == undefined || VendorID == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_MM_PO_GETLIST>
          <!--You may enter the following 2 items in any order-->
          <I_VENDORID>${VendorID}</I_VENDORID>
          <IT_PO>
             <!--Zero or more repetitions:-->
             <item>
                <!--Optional:-->
               
             </item>
          </IT_PO>
       </urn:ZBAPI_MM_PO_GETLIST>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MM_POLIST&receiverParty=&receiverService=&interface=SI_MM_POLIST&interfaceNamespace=http://vrm_kaartech_shyam',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        PurchaseOrderData = resp.data

        xml2js.parseString(PurchaseOrderData, (err, result) => {
            if (err) {
                throw err;
            }




            //res.status(200).send(result)
            //const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_LOGIN.Response'][0]["IT_USER"][0]["item"][0];
            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_MM_PO_GETLIST.Response'][0]["IT_PO"];

            if (userResult[0] != '') {
                const PurchaseOrderResponse = userResult[0]["item"]
                const PurchaseOrderArrObject = []
                PurchaseOrderResponse.forEach((value) => {
                    const tempObj = {}
                    tempObj["PURCHASE_ORDER_NO"] = value["EBELN"][0]
                    tempObj["COMPANY_CODE"] = value["BUKRS"][0]
                    tempObj["PURCHASE_DOC_CATAGORY"] = value["BSTYP"][0]
                    tempObj["PURCHASE_DOC_TYPE"] = value["BSART"][0]
                    tempObj["STATUS"] = value["STATU"][0]
                    tempObj["PURCHASE_ORDER_CREATED_DATE"] = value["AEDAT"][0]
                    tempObj["VENDOR_NO"] = value["LIFNR"][0]
                    tempObj["CUSTOMER_NO"] = value["KUNNR"][0]
                    tempObj["PURCHASE_ORGANISATION"] = value["EKORG"][0]
                    tempObj["PURCHASE_GROUP"] = value["EKGRP"][0]
                    tempObj["PURCHASE_DOC_DATE"] = value["BEDAT"][0]
                    tempObj["BID_LAST_DATE"] = value["ANGDT"][0]

                    PurchaseOrderArrObject.push(tempObj);
                })

                res.status(200).send(PurchaseOrderArrObject)

            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }

            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });

}

const PurchaseOrderDetail = (req, res) => {
    const PurchaseOrderNo = req.body.PurchaseOrderNo

    if (PurchaseOrderNo == undefined || PurchaseOrderNo == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_MM_PO_GETDETAIL>
          <!--You may enter the following 3 items in any order-->
          <I_PONUMBER>${PurchaseOrderNo}</I_PONUMBER>
          <IT_POHEADER>
             <!--Zero or more repetitions:-->
             <item>
              
             </item>
          </IT_POHEADER>
          <IT_POITEM>
             <!--Zero or more repetitions:-->
             <item>
               
             </item>
          </IT_POITEM>
       </urn:ZBAPI_MM_PO_GETDETAIL>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MM_PODETAIL&receiverParty=&receiverService=&interface=SI_MM_PODETAIL&interfaceNamespace=http://vrm_kaartech_shyam',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        PurchaseOrderDetailData = resp.data

        xml2js.parseString(PurchaseOrderDetailData, (err, result) => {
            if (err) {
                throw err;
            }




            //res.status(200).send(result)
            //const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_LOGIN.Response'][0]["IT_USER"][0]["item"][0];
            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_MM_PO_GETDETAIL.Response'][0]["IT_POITEM"];

            if (userResult[0] != '') {
                const PurchaseOrderItemResponse = userResult[0]["item"]
                const PurchaseOrderItemArrObject = []
                PurchaseOrderItemResponse.forEach((value) => {
                    const tempObj = {}
                    tempObj["PURCAHSE_ORDER_NO"] = value["PO_NUMBER"][0]
                    tempObj["PURCHASE_ORDER_ITEM"] = value["PO_ITEM"][0]
                    tempObj["PO_CHNG_DATE"] = value["CHANGED_ON"][0]
                    tempObj["MAT_NAME"] = value["SHORT_TEXT"][0]
                    tempObj["MAT_NO"] = value["MATERIAL"][0]
                    tempObj["MATN_NO"] = value["PUR_MAT"][0]
                    tempObj["COMP_CODE"] = value["CO_CODE"][0]
                    tempObj["PLANT"] = value["PLANT"][0]
                    tempObj["STORAGE_LOC"] = value["STORE_LOC"][0]
                    tempObj["MAT_GRP"] = value["MAT_GRP"][0]
                    tempObj["PURCHASING_INFO_REC"] = value["INFO_REC"][0]
                    tempObj["TARGET_QTY"] = value["TARGET_QTY"][0]
                    tempObj["TOT_QTY"] = value["QUANTITY"][0]
                    tempObj["UNIT"] = value["UNIT"][0]
                    tempObj["NET_PRICE"] = value["NET_PRICE"][0]
                    tempObj["PRICE_UNIT"] = value["PRICE_UNIT"][0]
                    tempObj["NET_VALUE"] = value["NET_VALUE"][0]
                    tempObj["GROS_VALUE"] = value["GROS_VALUE"][0]
                    tempObj["QUOT_DEAD"] = value["QUOT_DEAD"][0]
                    tempObj["PRICE_DATE"] = value["PRICE_DATE"][0]
                    tempObj["DOC_CAT"] = value["DOC_CAT"][0]
                    tempObj["EFFECTIVE_VAL"] = value["EFF_VALUE"][0]
                    tempObj["RFQ"] = value["RFQ"][0]
                    tempObj["RFQ_ITEM"] = value["RFQ_ITEM"][0]


                    PurchaseOrderItemArrObject.push(tempObj);
                })

                res.status(200).send(PurchaseOrderItemArrObject)

            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }

            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });

}


const GoodsReciept = (req, res) => {
    const PurchaseOrderNo = req.body.PurchaseOrderNo

    if (PurchaseOrderNo == undefined || PurchaseOrderNo == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_MM_GOODSRECIEPT>
          <!--You may enter the following 4 items in any order-->
          <I_EBELN>${PurchaseOrderNo}</I_EBELN>
          <IT_GRHEADER>
             <!--Zero or more repetitions:-->
             <item>
                <!--Optional:-->
               
             </item>
          </IT_GRHEADER>
          <IT_GRITEM>
             <!--Zero or more repetitions:-->
             <item>
               
             </item>
          </IT_GRITEM>
          <IT_RETURN>
             <!--Zero or more repetitions:-->
             <item>
                <!--Optional:-->
               
             </item>
          </IT_RETURN>
       </urn:ZBAPI_MM_GOODSRECIEPT>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MM_GOODSRECIEPT&receiverParty=&receiverService=&interface=SI_MM_GOODSRECIEPT&interfaceNamespace=http://vrm_kaartech_shyam',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        GoodsRecieptData = resp.data

        xml2js.parseString(GoodsRecieptData, (err, result) => {
            if (err) {
                throw err;
            }




            //res.status(200).send(result)
            //const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_LOGIN.Response'][0]["IT_USER"][0]["item"][0];
            var userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_MM_GOODSRECIEPT.Response'][0]["IT_GRITEM"];

            if (userResult[0] != '') {

                const GoodsRecieptResponse = userResult[0]["item"]
                var GoodsRecieptArrObject = []
                console.log("hello hello goods")


                GoodsRecieptResponse.forEach((value) => {
                    const tempObj = {}
                    tempObj["MAT_DOC"] = value["MAT_DOC"][0]
                    tempObj["DOC_YEAR"] = value["DOC_YEAR"][0]
                    tempObj["MATDOC_ITM"] = value["MATDOC_ITM"][0]
                    tempObj["MATERIAL"] = value["MATERIAL"][0]
                    tempObj["PLANT"] = value["PLANT"][0]
                    tempObj["STORAGE_LOC"] = value["STGE_LOC"][0]
                    tempObj["MOVEMENT_TYP"] = value["MOVE_TYPE"][0]
                    tempObj["ENTRY_QUANT"] = value["ENTRY_QNT"][0]
                    tempObj["ENTRY_UOM"] = value["ENTRY_UOM"][0]
                    tempObj["ENTRY_UOM_ISO"] = value["ENTRY_UOM_ISO"][0]
                    tempObj["PO_PR_QNT"] = value["PO_PR_QNT"][0]
                    tempObj["ORDERPR_UN"] = value["ORDERPR_UN"][0]
                    tempObj["ORDERPR_UN_ISO"] = value["ORDERPR_UN_ISO"][0]
                    tempObj["PO_NUMBER"] = value["PO_NUMBER"][0]
                    tempObj["PO_ITEM"] = value["PO_ITEM"][0]
                    GoodsRecieptArrObject.push(tempObj);
                })

                //res.status(200).send(GoodsRecieptArrObject) 

                // HEADER GOODS RECIEPT  

                userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_MM_GOODSRECIEPT.Response'][0]["IT_GRHEADER"];

                if (userResult[0] != '') {

                    const GoodsRecieptHeaderResponse = userResult[0]["item"]
                    var GoodsRecieptHeaderArrObject = []
                    console.log("hello hello goods")


                    GoodsRecieptHeaderResponse.forEach((value) => {
                        const tempObj = {}
                        tempObj["MAT_DOC_NO"] = value["MAT_DOC"][0]
                        tempObj["DOC_YEAR"] = value["DOC_YEAR"][0]
                        tempObj["DOC_DATE"] = value["DOC_DATE"][0]
                        tempObj["PSTNG_DATE"] = value["PSTNG_DATE"][0]
                        tempObj["ENTRY_DATE"] = value["ENTRY_DATE"][0]
                        tempObj["ENTRY_TIME"] = value["ENTRY_TIME"][0]


                        GoodsRecieptHeaderArrObject.push(tempObj);
                    });
                    var GoodsHeader = GoodsRecieptHeaderArrObject[1]
                        // res.status(200).send([GoodsHeader, GoodsRecieptArrObject])
                }


            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }


            res.status(200).send([GoodsHeader, GoodsRecieptArrObject])
        });





    }).catch(err => { console.log(err) });

}











const PurchaseOrderHistory = (req, res) => {
    const PurchaseOrderNo = req.body.PurchaseOrderNo

    if (PurchaseOrderNo == undefined || PurchaseOrderNo == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_MM_PO_GETHISTORY>
          <!--You may enter the following 2 items in any order-->
          <I_EBELN>${PurchaseOrderNo}</I_EBELN>
          <IT_POHISTORY>
             <!--Zero or more repetitions:-->
             <item>
               
             </item>
          </IT_POHISTORY>
       </urn:ZBAPI_MM_PO_GETHISTORY>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MM_POHISTORY&receiverParty=&receiverService=&interface=SI_MM_POHISTORY&interfaceNamespace=http://vrm_kaartech_shyam',
        body, {
            headers: {
                'Content-Type': 'text/xml',
                'Authorization': 'Basic ' + base64.encode(config.POUSERNAME + ':' + config.POPASSWORD)


            }
        }).then(resp => {

        PurchaseOrderHistoryData = resp.data

        xml2js.parseString(PurchaseOrderHistoryData, (err, result) => {
            if (err) {
                throw err;
            }




            //res.status(200).send(result)
            //const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_LOGIN.Response'][0]["IT_USER"][0]["item"][0];
            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_MM_PO_GETHISTORY.Response'][0]["IT_POHISTORY"];

            if (userResult[0] != '') {
                const PurchaseOrderHistoryResponse = userResult[0]["item"]
                const PurchaseOrderHistoryArrObject = []
                PurchaseOrderHistoryResponse.forEach((value) => {
                    const tempObj = {}
                    tempObj["PURCHASE_DOC_NO"] = value["EBELN"][0]
                    tempObj["ITEM_NO"] = value["EBELP"][0]
                    tempObj["MAT_DOC_YEAR"] = value["GJAHR"][0]
                    tempObj["NO_OF_MAT_DOC"] = value["BELNR"][0]
                    tempObj["MAT_DOC_ITEM"] = value["BUZEI"][0]
                    tempObj["PO_HISTORY_CATOG"] = value["BEWTP"][0]
                    tempObj["MOVEMENT_TYPE"] = value["BWART"][0]
                    tempObj["POSTING_DATE"] = value["BUDAT"][0]
                    tempObj["QUANTITY"] = value["MENGE"][0]
                    tempObj["QUANTITY_PO_UNIT"] = value["BPMNG"][0]
                    tempObj["AMT_LOC_CURR"] = value["DMBTR"][0]
                    tempObj["AMT_DOC_CURR"] = value["WRBTR"][0]
                    tempObj["CURR_KEY"] = value["WAERS"][0]
                    tempObj["GR_LOC_CURR"] = value["AREWR"][0]
                    tempObj["GR_BLOCK_ORDER_UNIT"] = value["WESBS"][0]
                    tempObj["GR_BLOCK_QUANT"] = value["BPWES"][0]
                    tempObj["DEBCREDIND"] = value["SHKZG"][0]
                    tempObj["FISCAL_YEAR"] = value["LFGJA"][0]
                    tempObj["ACC_DOC_ENTER_DAT"] = value["CPUDT"][0]
                    tempObj["ACC_DOC_ENTER_TIM"] = value["CPUTM"][0]
                    tempObj["INV_VAL_LOC_CURR"] = value["REEWR"][0]
                    tempObj["INV_VAL_FOREIGN_CURR"] = value["REFWR"][0]
                    tempObj["MAT_NO"] = value["MATNR"][0]
                    tempObj["PLANT"] = value["WERKS"][0]
                    tempObj["GR_CLR_VAL"] = value["AREWW"][0]
                    tempObj["LOC_CURR_KEY"] = value["HSWAE"][0]
                    tempObj["QUANTITY"] = value["BAMNG"][0]
                    tempObj["DOC_DATE"] = value["BLDAT"][0]

                    PurchaseOrderHistoryArrObject.push(tempObj);
                })

                res.status(200).send(PurchaseOrderHistoryArrObject)

            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }

            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });
}

const Invoice = (req, res) => {
    const PurchaseOrderNo = req.body.PurchaseOrderNo

    if (PurchaseOrderNo == undefined || PurchaseOrderNo == null) {
        res.status(404).send({ "Message": "Invalid request with null value or undefinded", "ErrCode": "100" })
    }

    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
       <urn:ZBAPI_MM_INVOICE>
          <!--You may enter the following 2 items in any order-->
          <I_EBELN>${PurchaseOrderNo}</I_EBELN>
          <IT_INVOICE>
             <!--Zero or more repetitions:-->
             <item>
               
             </item>
          </IT_INVOICE>
       </urn:ZBAPI_MM_INVOICE>
    </soapenv:Body>
 </soapenv:Envelope>`

    axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MM_INVOICE&receiverParty=&receiverService=&interface=SI_MM_INVOICE&interfaceNamespace=http://vrm_kaartech_shyam',
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




            //res.status(200).send(result)
            //const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_FICO_LOGIN.Response'][0]["IT_USER"][0]["item"][0];
            const userResult = result['SOAP:Envelope']['SOAP:Body'][0]['ns0:ZBAPI_MM_INVOICE.Response'][0]["IT_INVOICE"];

            if (userResult[0] != '') {
                const InvoiceResponse = userResult[0]["item"]
                const InvoiceArrObject = []
                InvoiceResponse.forEach((value) => {
                    const tempObj = {}
                    tempObj["ACC_DOC_NO"] = value["BELNR"][0]
                    tempObj["FISCAL_YEAR"] = value["GJAHR"][0]
                    tempObj["DOC_ITEM"] = value["BUZEI"][0]
                    tempObj["PO_DOC_NO"] = value["EBELN"][0]
                    tempObj["PO_ITEM_NO"] = value["EBELP"][0]
                    tempObj["SEQ_NO_ACC"] = value["ZEKKN"][0]
                    tempObj["MAT_NO"] = value["MATNR"][0]
                    tempObj["VAL_AREA"] = value["BWKEY"][0]
                    tempObj["VAL_TYP"] = value["BUKRS"][0]
                    tempObj["PLANT"] = value["WERKS"][0]
                    tempObj["AMT_DOC_CURR"] = value["WRBTR"][0]
                    tempObj["CRDBIND"] = value["SHKZG"][0]
                    tempObj["TAX_CODE"] = value["MWSKZ"][0]
                    tempObj["QUANTITY"] = value["MENGE"][0]
                    tempObj["ORDER_UNIT"] = value["BSTME"][0]
                    tempObj["QUANT_PO_PRICE_UNIT"] = value["BPMNG"][0]
                    tempObj["ORDER_PRICE_UNIT"] = value["BPRME"][0]
                    tempObj["TOTAL_VALUE_STOCK"] = value["LBKUM"][0]
                    tempObj["TOATL_VALUE_STOCK_QUAN"] = value["SALK3"][0]
                    tempObj["MAT_STOCK"] = value["MATBF"][0]

                    InvoiceArrObject.push(tempObj);
                })

                console.log(InvoiceArrObject);
                res.status(200).send(InvoiceArrObject);

            } else {
                res.status(404).send({ "Message": "No Data is found for the particular request", "ErrCode": "101" })
            }

            // log JSON string
            //res.status(200).send(result)

        });





    }).catch(err => { console.log(err) });
}




module.exports = { RFQ, PurchaseOrderList, PurchaseOrderDetail, GoodsReciept, PurchaseOrderHistory, Invoice }