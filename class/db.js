var db = require("mssql");

var connection;

exports.connect = function(conn, callback){

	connection = new db.Connection(conn);

	connection.connect(function(error){

		if(!error){

			callback();

		}else{

			console.log(error);

		}

	});

}

var nextId

exports.getCitys = function(citys, callback){

	var SQL_SELECT = "SELECT id = IdMunicipio, code = Codigo, description = Descricao FROM Municipio WHERE IdUF = 24";

	if(citys){

		SQL_SELECT += " AND Codigo BETWEEN " + citys.begin + " AND " + citys.end;

	}

	var request = new db.Request(connection);

	request.query(SQL_SELECT, function(error, records){

		callback(records);

	});

}

exports.insertIPVAPublicado = function(cityId, ipvaPublicado){

	var SQL_INSERT = "EXEC dbo.NextId 'IdIpvaPublicado', 'IpvaPublicado', @IdIpvaPublicado OUTPUT "
	               + "INSERT INTO IpvaPublicado VALUES (@IdIpvaPublicado, @IdMunicipio, @Exercicio, @Mes, @Valor);";

	var sqlFinal = "";

	var years = "";
	var months = "";

	var aMonths = [];

	ipvaPublicado.forEach(function(ipvaPublicadoForYear, year){

		years += (years == "" ? "" : ",") + year;

		ipvaPublicadoForYear.forEach(function(value, month){

			if(months.indexOf(month) == -1)
				months += (months == "" ? "" : ",") + month;

			months[month] = month;

			var sql = SQL_INSERT

			sql = sql.replace("@IdMunicipio", cityId);
			sql = sql.replace("@Exercicio", year);
			sql = sql.replace("@Mes", month);
			sql = sql.replace("@Valor", value.replaceAll(".", "").replaceAll(",", "."));

			sqlFinal += sql;

		});

	});

	sqlFinal = "DECLARE "
	         + "	@IdIpvaPublicado Int "
	         + "DELETE FROM IpvaPublicado WHERE IdMunicipio = " + cityId + " AND Exercicio IN (" + years + ") AND Mes IN (" + months + ") "
	         + sqlFinal;

	var request = new db.Request(connection);

	request.query(sqlFinal, function(error){

		if(error){

			console.log(error);

		}

	});



}

exports.insertIPVATce = function(cityId, ipvaTce){

	var SQL_INSERT = "EXEC dbo.NextId 'IdIpvaContabilizado', 'IpvaContabilizado', @IdIpvaContabilizado OUTPUT "
	               + "INSERT INTO IpvaContabilizado VALUES (@IdIpvaContabilizado, @IdMunicipio, 0, '@Data', @Valor, GETDATE(), 'Importador Aut.');";

	var sqlFinal = "";

	var years = "";
	var months = "";

	var aMonths = [];

	ipvaTce.forEach(function(ipvaTceForYear, year){				

		years += (years == "" ? "" : ",") + year;

		ipvaTceForYear.forEach(function(value, month){

			if(months.indexOf(month) == -1)
				months += (months == "" ? "" : ",") + month;

			months[month] = month;

			var sql = SQL_INSERT;

			sql = sql.replace("@IdMunicipio", cityId);
			sql = sql.replace("@Data", year + "-" + month + "-01");
			sql = sql.replace("@Valor", value);

			sqlFinal += sql;

		});

	});

	sqlFinal = "DECLARE "
	         + "	@IdIpvaContabilizado Int "
	         + "DELETE FROM IpvaContabilizado WHERE IdMunicipio = " + cityId + " AND YEAR(Data) IN (" + years + ") AND MONTH(Data) IN (" + months + ") "
	         + sqlFinal;

	var request = new db.Request(connection);

	request.query(sqlFinal, function(error){

		if(error){

			console.log(error);
			console.log(sqlFinal);

		}

	});

}