var db = require("./class/db");
var crawler = require("./class/crawler");
var lib = require("./class/lib");
var dbconfig = require("./dbconfig");
var params = require("./params");

//

console.log("");
console.log("Parâmetros:");
console.log("Municípios: Código " + params.citys.begin + " ao Código " + params.citys.end);
console.log("Exercício: " + params.years.begin + " a " + params.years.end);
console.log("Meses: " + params.months.join(","));
console.log("");

//

if(!(params.years.begin >= 2009) || params.years.begin > params.years.end){
	console.log("Intervalo de Exercícios inválido, verifique os parâmetros.");
	process.exit();
}

//

db.connect(dbconfig.conn, function(){

	console.log("Buscando Município(s) ...");

	db.getCitys(params.citys, function(citys){

		if(citys.length == 0){

			console.log("Nenhum Município foi selecionado, verifique os parâmetros.");
			process.exit();

		}

		var getRecursiveForCity = function(city){

			console.log("Inserindo IPVA Publicado do Município " + city.code + " - " + city.description + " ...");

			var ipvaPublicado = [];
			var currentYear = params.years.begin;

			var getRecursiveForYear = function(ipvaPublicadoFinded){

				ipvaPublicado[currentYear] = ipvaPublicadoFinded;

				currentYear++;

				if(currentYear <= params.years.end){

					crawler.getIPVAPublicado(city.code, currentYear, params.months, getRecursiveForYear);

				}else{

					db.insertIPVAPublicado(city.id, ipvaPublicado);

					if(citys.length > 0){

						getRecursiveForCity(citys.shift());

					}

				}

			};

			crawler.getIPVAPublicado(city.code, currentYear, params.months, getRecursiveForYear);

		}

		getRecursiveForCity(citys.shift());

	}); 

	//

});