exports.log = function (msg) {
  console.log(new Date().toString() + ' >>> ' + msg);
};

exports.lookupTableReverse = function(DB, db, table, col, value) {
    var fullTable = db+'.'+table;
    var query = 'SELECT id from '+fullTable+' where '+col+'=?';
    var id = 0;
    DB.query(query, [value], function(err,results) {
        if (err) {
            console.log('findOrCreateRow Select Error: ' + err.message);
        }
        else if (results.length > 0) {
            var row = results[0];
            id = row['id'];
        }
    });
    return id;
};

exports.lookupTable = function(DB, db, table, id, col) {
    var fullTable = db+'.'+table;
    var query = 'SELECT '+col+' from '+fullTable+' where id=?';
    var value = null;
    MC.query(query, [id], function(err,results) {
        if (err) {
            /*
             TODO: how do I use the callback stuff along with a return value?
             */
            console.log('findOrCreateRow Select Error: ' + err.message);
        }
        else if (results.length > 0) {
            var row = results[0];
            value = row[col];
        }
    });
    return value;
};