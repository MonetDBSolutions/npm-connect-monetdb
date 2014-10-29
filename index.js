
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
		self.conn.queryQ("SELECT sess FROM session WHERE sid = ? AND expire >= ?", 
				[sid, now]).then(function(result) {
			if(result.rows > 0) {
				try {
					fn(null, JSON.parse(data[0][0]));
				} catch(e) {
					self.destroy(sid, fn);
				}
			} else {
				fn(null);
			}
		}, function(err) {
			fn(err);
		}).done();
	};

	MDBSessStore.prototype.set = function(sid, sess, fn) {
		var self = this;
		var maxAge = sess.cookie.maxAge ? sess.cookie.maxAge : 24 * 3600;
		self.conn.queryQ("SELECT * FROM session WHERE sid = ?", [sid]).then(function(result) {
			var query;
			var params;
			if(result.rows == 0) {
				query = "INSERT INTO session (sid, sess, expire) VALUES (?, ?, ?)";
				params = [sid, JSON.stringify(sess), Math.round(Date.now() / 1000) + maxAge];
			} else {
				query = "UPDATE session SET sess = ? WHERE sid = ?";
				params = [JSON.stringify(sess), sid];
			}
			return self.conn.queryQ(query, params);
		}).then(function() {
			fn && fn(null);
		}, function(err) {
			fn && fn(err);
		}).done();
	};

	MDBSessStore.prototype.destroy = function(sid, fn) {
		this.conn.queryQ("DELETE FROM session WHERE sid = ?", [sid]).then(function() {
			fn && fn(null);
		}, function(err) {
			fn && fn(err);
		});
	};

	return MDBSessStore;
}
