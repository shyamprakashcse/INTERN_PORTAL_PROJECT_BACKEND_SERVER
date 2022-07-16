const express = require("express");
const app = express();
const auth = require("../Controllers/auth");
const sales = require("../Controllers/sales");
const purchase = require("../Controllers/purchase");
const employee = require("../Controllers/employee")


const route = express.Router();
const bodyParser = require("body-parser");


app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));


// Authentications API
route.get("/barrer", auth.TokenAuthentication, auth.checkBarrerToken)
route.post("/token", auth.GetToken);
route.post("/payload", auth.GetPayload);
route.post("/custlogin", auth.CustomerLogin);
route.post("/vendlogin", auth.VendorLogin);
route.post("/emplogin", auth.HCMLogin)

// Customer-Sales FICO  API 
route.post("/inquiry", sales.Inquiry);
route.post("/salesorder", sales.SalesOrder);
route.post("/invoice", sales.Invoice);



// Vendor-Purchase MM API 

route.post("/rfq", purchase.RFQ);
route.post("/polist", purchase.PurchaseOrderList);
route.post("/podetail", purchase.PurchaseOrderDetail);
route.post("/goodsbill", purchase.GoodsReciept);
route.post("/pohistory", purchase.PurchaseOrderHistory);
route.post("/vendinvoice", purchase.Invoice);


// Human Resource Employee - HCM API 

route.post("/empprofile", employee.EmployeeProfileDetail);
route.post("/empleave", employee.EmployeeLeaveDetail);
route.post("/empleavegraph", employee.EmployeeLeaveGraphDetail);
route.post("/emppayslip", employee.Payslip);
route.post("/emppayslippdf", employee.PayslipPDF);


module.exports = route;