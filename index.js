
module.exports = function(session) {

	function MDBSessStore(conn) {
		this.conn = conn;
	}

	MDBSessStore.prototype = new session.Store();
	MDBSessStore.prototype.constructor = MDBSessStore;


	MDBSessStore.prototype.get = function(sid, fn) {
		var self = this;
		var now = Math.round(Date.now() / 1000);
		if(Math.random() < 0.01) {
			self.conn.query("DELETE FROM session WHERE expire < ?", [now]);
		}
		self.conn.query("SELECT sess FROM session WHERE sid = ? AND expire >= ?", 
			[sid, now], 
			function(err, result) {
				if(err) {
					return fn(err);
				}
				if(!result.data || !result.data[0] || !result.data[0][0]) {
					return fn(null);
				}
				try {
					return fn(null, JSON.parse(result.data[0][0]));
				} catch(e) {
					return self.destroy(sid, fn);
				}
			}
		);
	};

	MDBSessStore.prototype.set = function(sid, sess, fn) {
		var self = this;
		var maxAge = sess.cookie.maxAge ? sess.cookie.maxAge : 24 * 3600;

		self.conn.query("SELECT * FROM session WHERE sid = ?", [sid], function(err, result) {
			if(err) return fn(err);
			if(result.rows == 0) {
				self.conn.query("INSERT INTO session (sid, sess, expire) VALUES (?, ?, ?)", 
					[sid, JSON.stringify(sess), Math.round(Date.now() / 1000) + maxAge], 
					function(err) {
						fn && fn(err);
					}
				);
			} else {
				self.conn.query("UPDATE session SET sess = ? WHERE sid = ?",
					[JSON.stringify(sess), sid],
					function(err) {
						fn && fn(err);
					}
				);
			}
		});
	};

	MDBSessStore.prototype.destroy = function(sid, fn) {
		this.conn.query("DELETE FROM session WHERE sid = ?",
			[sid],
			function(err) {
				fn && fn(err);
			}
		);
	};

	return MDBSessStore;
}
