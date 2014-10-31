# connect-monetdb
A straightforward MonetDB session store for Connect/Express. This module has no direct dependencies, but it does require you to pass it two things:
1. A session variable, resulting from require("express-session")
2. An active MonetDB connection, resulting from a call to require("monetdb").connect() or require("monetdb").connectQ

# Installation
npm install [-g] connect-monetdb

# Usage
**Initializing the store by creating a MonetDB connection and passing it to the store constructor**
```
var MonetDB = require('monetdb');
var session = require("express-session");
var MDBSessStore = require("connect-monetdb")(session);

var conn = MonetDB.connect({
	dbname: "demo"
}, function(err) {
	if(err) {
		throw new Error("Could not connect to the database: "+err);
	}
});

var store = new MDBSessStore(conn);
```

**Set up the express app to use the just created store**
```
var sessOpt = {
	store: store,
	secret: "i2D#0wj38D_kZhW20&qA97hQQd@0/S81h",
	rolling: true,
	resave: false,
	saveUninitialized: true,
	unset: "destroy"
};

var app = require("express")();
app.use(session(sessOpt));
```

**Please report any suggestions/bugs to robin.cijvat@monetdbsolutions.com**
