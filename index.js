
module.exports = function(session) {

	function MDBSessStore(db) {
		if(!(db instanceof MonetDBConnection) && !(db instanceof MonetDBPool)) {
            throw new Error("MDBSessStore needs as its first argument either a MonetDBConnection object or a MonetDBPool object");
        }
        this.db = db;
	}

	MDBSessStore.prototype = new session.Store();
	MDBSessStore.prototype.constructor = MDBSessStore;


	MDBSessStore.prototype.get = function(sid, fn) {
		var self = this;
		var now = Math.round(Date.now() / 1000);
		if(Math.random() < 0.01) {
			self.db.query("DELETE FROM session WHERE expire < ?", [now]);
		}
		self.db.query("SELECT sess FROM session WHERE sid = ? AND expire >= ?", [sid, now], false).then(function(result) {
            if (!result.data || !result.data[0] || !result.data[0][0]) {
                return fn && fn(null);
            }
            try {
                return fn && fn(null, JSON.parse(result.data[0][0]));
            } catch (e) {
                return self.destroy(sid, fn);
            }
        }, function(err) {
            fn && fn(err);
        });
	};

	MDBSessStore.prototype.set = function(sid, sess, fn) {
		var self = this;
		var maxAge = sess.cookie.maxAge ? sess.cookie.maxAge : 24 * 3600;

		self.db.query("SELECT * FROM session WHERE sid = ?", [sid]).then(function(result) {
			if(result.rows == 0) {
				return self.db.query(
                    "INSERT INTO session (sid, sess, expire) VALUES (?, ?, ?)",
					[sid, JSON.stringify(sess), Math.round(Date.now() / 1000) + maxAge]
                );
			}
            return self.db.query(
                "UPDATE session SET sess = ? WHERE sid = ?",
                [JSON.stringify(sess), sid]
            );
		}).then(function() {
            fn && fn(null);
        }).fail(function(err) {
            fn && fn(err);
        });
	};

	MDBSessStore.prototype.destroy = function(sid, fn) {
		this.conn.query("DELETE FROM session WHERE sid = ?", [sid]).then(function() {
            fn && fn();
        }).fail(function(err) {
            fn && fn(err);
        });
	};

	return MDBSessStore;
};
