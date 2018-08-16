<!--
+++
title = "Digits Server - REST-API"
draft = false
date = "2017-10-08T08:05:08+01:00"
description = "REST-API documentation..."
tags = [ "development", "readme", "RESTAPI", "REST" ]
categories = [ "Development", "rest" ]
+++
-->

# TODO:  this is the wrong documentation - just copied ...., but we need to update to the according REST-API defined ...
 TODO

# DigitS: REST-API Documentation #

**Version**: 0.5-beta. (29th october 2017)

**Note**:  status in progress (Sprint 1) - still under development

-------------------

### General Return-Values ###

The server API returns a http status code for all restful calls. Depending on the return code the response body may contain a JSON error.

return code  | meaning       | description
:-----------:|:--------------|:--------------------
`200`| OK  |  
`400`| bad request (client error)  | a JSON response body with more error details is returned to the client:  <pre>ResponseBody { <br>   Error : { Code: < Error Number >, Desc: ‘< Error Desc >’ } <br>}</pre> 
`401`| unauthorized | the API request requires a JWT security token (login before)
`403`| forbidden  | security authorization does not contain the necessary security-role (via JWT token)
`404`| not found | requested data is not available
`500`| internal server error  | a JSON response body with more error details is returned to the client: <pre>ResponseBody { <br>   Error : { Code: < Error Number >, Desc: ‘< Error Desc >’ } <br>}</pre>
  
  
  
  


-------------------

### Security (Session) (w/o auth)

#### Security Authentication

* **`POST /login`** 
	
	Checks the security via the smart-contract of the blockchain.  The information of the body (user-id ethereum address + company identityproxy ethereum address) is taken.  The function returns a valid JWT token for the current session (with timeout = ???).
	
	Example:
	<pre>
	POST /login
Body {
	UserID: User Ethereum Address (Hex String)
	CompanyID: IdentityProxy Ethereum Address (Hex String)
}
ResponseHeader {
	Authorization: 43579JHDGS63... (String)
}
	</pre>

* TODO: **`POST /logout`**

	**Note:** Currently we do not necessarily need the logout.  Instead the client can just delete the JWT-token in memory - for the moment - in the long run this should be done properly for logging/monitoring purposes.

<br>

#### Security Authorization

(currently not implemented - Sprint 3)

***Khabir - PLEASE MAKE A SUGGESTION OF THE API !?***

* TODO: `GET /authorization/roles` - returns list of all available roles
* TODO: `GET /authorization/roles/<userid>` ( user ethereum address)
* TODO: `PUT /authorization/roles/<userid>?<roleid>` ( user ethereum address, role id )
* TODO: `DEL /authorization/roles/<userid>?<roleid>` ( user ethereum address, role id )

---------------------------

### User Administration (w/ auth)

(currently not implemented - Sprint 3)

***Khabir - PLEASE MAKE A SUGGESTION OF THE API !?***

* TODO: `GET /useradmin` ( company ) - returns a list of users with user profiles for a company (company via header)
* TODO: `PUT /useradmin/<user>` ( company, user ethereum address, user profile )
* (no removal at this state...)


##### User Json-Object

User profile is a json document with attributes:
```
firstname, surname, company, telephone, email, enable2fa, secret, terms_agreement, data_agreement, termsHash, dataHash, fax, im, role, status, isLoggedIn, token, warning, urgent
```

-------------------

### Masterdata (key/value) (per Mandant) (w/ auth)

**Note:** currently a very generic key-value-approach is chosen - the API notation might change within the next weeks for more details (e.g. seperation by type: legal entity, currency, etc....) (contact: Henner Harnisch) 

* `GET /masterdata/<key>` (key/value approach) - returns a JSON object of the requested masterdata (found via key in the database of the decentralized database).  The response might vary per bank/mandant. `<key>` is a string and a unique identifier. 
<pre>
ReponseBody {
		< JSON encoded string value that was previous stored with a put >
	}
</pre>

* `PUT /masterdata/<key>` (key/value approach) - creates or updates a masterdata with the passed JSON data (in the body of the request).  The content might vary per bank/mandant. `<key>` is a string and a unique identifier.
<pre>
Body {
		< JSON encoded string value to store >
	}
</pre>

* `DEL /masterdata/<key>` (key/value approach) - deletes a masterdata with the passed key in the decentral database of the bank/mandant. `<key>` is a string and a unique identifier.


##### Json-Object

A company json document with attributes:
```
key (unique id), name, preset (boolean is the name fixed i.e cannot change), reference1 (internal reference), reference2 (internal reference), payment (payment instructions), UstID, street, postcode, city, country, tel, fax, email, avatar
```

---------------


### Asset Data (first use-case: SSD) (w/ auth)

* **`GET /assets/<AssetType>`** (w/ auth)
 
	Returns a list of all asset-references for the given <AssetType>, where the identified company of the user (via the secured header information) is part of the arranger, seller or buyer of a asset-transaction. 
	 
	Note:  This list is created via the blockchain information and is therefore independent of the server (mandant setup).
	
	Note: `<AssetType>` is optional. Without `<AssetType>` alle assets will be returned.

	Example:
	<pre>
	GET /assets/<AssetType>
	Header {
		Authorization: 43579JHDGS63…
	}
	ReponseBody {
		[{
			AssetType: <SSD>,
			Assets: [{
				AssetID: <Internal Bank ID>,		
				AssetRef: <BaseURL (No Protocol)>
			},{
				AssetID: <Internal Bank ID>,		
				AssetRef: <BaseURL (No Protocol)>
			}...]
		},{
			AssetType: <MDP>,
			Assets: [{
				AssetID: <Internal Bank ID>,		
				AssetRef: <BaseURL (No Protocol)>
			},{
				AssetID: <Internal Bank ID>,		
				AssetRef: <BaseURL (No Protocol)>
			}...]
		}...] 
	}
	</pre>
	
* **`GET /asset/<AssetID>`** (w/ auth)

	Returns the full information (from database and blockchain) for a given asset.  This asset is identified by the required parameter <AssetID>.
	
	Example:
	<pre>
	GET /asset/<AssetID>
	Header {
		Authorization: 43579JHDGS63...
	}
	ReponseBody {
		JsonData: { seller: ‘….’, buyer: ‘...’ … }
	}
	</pre>
	
* **`PUT /asset/<AssetID>`** (w/ auth)

	Creates or Updates an asset.  The body must contain the full Json-Object of the asset.  Further the offline-transaction for the blockchain-entry must be provided.

	Example:
	<pre>
	PUT /asset/<AssetID>
	Header {
		Authorization: 43579JHDGS63…
	}
	Body {
		JsonData: { seller: ‘….’, buyer: ‘...’ … },
		OfflineTx: 0x34384683648675746565734... (Hex String)
	}
	</pre>
		
* (not removal of an asset supported) 


##### SSD-Asset Json-Object

A SSD json document with attributes:
```
address, obligor, counterparty, maturity, nominal, documentNumber, currency, interestRate, dayCountConvention, interestDue, interestPaymentPeriod, interestFirstDue, interestPaymentModality, termination, transferability, transferabilityText, overseas, createdDate, tradeDate, businessCalendar, obligorName, obligorUstNumber, obligorReference, obligorBuyerOrSeller, obligorStreet, obligorPostcode, obligorCity, obligorPaymentInstructions, obligorUserAddress, obligorFirstname, obligorSurname, obligorShortname, obligorEmail, obligorFax, obligorTelephone,
counterpartyName, counterpartyUstNumber, counterpartyReference, counterpartyBuyerOrSeller, counterpartyStreet, counterpartyPostcode, counterpartyCity, counterpartyPaymentInstructions, counterpartyUserAddress, counterpartyFirstname, counterpartySurname, counterpartyShortname, counterpartyEmail, counterpartyFax, counterpartyTelephone, createdOnDate, createdOnBy, createdOnByAddress, lastModifiedDate, lastModifiedBy, lastModifiedByAddress, structured, productType, internalReference, rejectReason, rejectReasonText, lastModifiedByCompany, status, _id,_rev, changes 
(array of ssd json documents that tracks the changes for this ssd)
```


----------------

## Dokumentation / Links ##


* Online Swagger Documentation: [https://localhost:8443/swagger-ui.html#/](https://localhost:8443/swagger-ui.html#/)
* Contact:  [Daniel Dietrich](https://github.com/danieldietrich)

----------------
Copyright &copy; 2017 [digit-s.com](digit-s.com)
