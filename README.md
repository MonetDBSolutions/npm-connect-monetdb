# connect-monetdb

[![Build Status](https://travis-ci.org/MonetDB/npm-connect-monetdb.svg)](https://travis-ci.org/MonetDB/npm-connect-monetdb)
[![npm version](https://badge.fury.io/js/connect-monetdb.svg)](http://badge.fury.io/js/connect-monetdb)

A straightforward MonetDB session store for Connect/Express. This module has no direct dependencies, but it does require you to pass it two things:

1. A session variable, resulting from require("express-session")
2. A [MonetDBConnection](https://github.com/MonetDB/monetdb-nodejs#mdbconnection), 
or a [MonetDBPool](https://github.com/MonetDB/monetdb-pool-nodejs) object

# Installation
npm install [-g] connect-monetdb

# Create a table to store session information

```sql
CREATE TABLE session (
    sid              STRING        NOT NULL PRIMARY KEY,
    sess             STRING        NOT NULL,
    expire           INT           NOT NULL
);
```

# Usage
**Initializing the store by creating a MonetDBConnection object and passing it to the store constructor**
```javascript
var MonetDBConnection = require('monetdb')();
var session = require("express-session");
var MDBSessStore = require("connect-monetdb")(session);

var conn = new MonetDB({ dbname: "demo" });
conn.connect();

var store = new MDBSessStore(conn);
```

**Initializing the store by creating a MonetDBPool object and passing it to the store constructor**
```javascript
var MonetDBPool = require('monetdb-pool')();
var session = require("express-session");
var MDBSessStore = require("connect-monetdb")(session);

var pool = new MonetDBPool({ nrConnections: 4 }, { dbname: "demo" });
pool.connect();

var store = new MDBSessStore(pool);
```

**Set up the express app to use the just created store**
```javascript
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
