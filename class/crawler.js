exports.getIPVAPublicado = function(cityCode, year, months, callback){

	var request = require("request");
	var cheerio = require("cheerio");

	var $;
	var formData;

	var _PAGE_TO_SCRAPING = "https://www.fazenda.sp.gov.br/RepasseConsulta/Consulta/repasse.aspx";

	request(_PAGE_TO_SCRAPING, function(error, response, body) {

		if(response.statusCode === 200) {

	        $ = cheerio.load(body);

			formData = {};

			$("form [name]").each(function(){

				if($(this).val()){

					formData[$(this).attr("name")] = $(this).val();

				}

			});

			formData["ctl00$ConteudoPagina$ddlMuni"] = cityCode;
			formData["ctl00$ConteudoPagina$ddlAno"] = year;
			formData["ctl00$ConteudoPagina$rblTipo"] = "ANO";

			request.post({url: _PAGE_TO_SCRAPING, form: formData}, function(error, response, body) {

				if(response.statusCode === 200) {
			        
			        $ = cheerio.load(body);

			        //

			        var ipvaPublicado = [];

			        var month = 0;
			        var col = 0;

			        $("#ConteudoPagina_gdvRepasse tr").each(function(){

			        	if($(this).find("td").length > 0){

			        		var monthsDescription = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

			        		var monthDescription = $(this).find("td").first().text();

			        		month = monthsDescription.indexOf(monthDescription.substring(0, 3).toLowerCase()) + 1;

			        		if(months.indexOf(month) > -1){

				        		col = 0;

					        	$(this).find("td").each(function(){

					        		col++;

					        		if(col == 3){

					        			ipvaPublicado[month] = $(this).text();

					        		}

					        	});

					        }

				        }

			        });

			        callback(ipvaPublicado);

			        //
			        
			    }else{

			        return false;

			    }

			});        

	    }else{

	        return false;

	    }

	});

}


exports.getIPVATce = function(cityName, year, months, callback){

	var http = require("http");
	var fs = require("fs");
	var lib = require("../class/lib");

	var file;

	var _PAGE_TO_DOWNLOAD = "http://transparencia.tce.sp.gov.br/receitas-lancamentos-csv";

	//

	cityName = lib.simplifyStr(cityName);

	//

	http.get(_PAGE_TO_DOWNLOAD + "/" + cityName + "/" + year, function(response) {

		if(response.statusCode == 200){

			var fileText = "";

	    	response.setEncoding('utf8');

			response.on('data', function(data){
				
				fileText += data;

			});

	    	response.on('end', function(){
				
	    		var ipvaTce = [];

	    		//

	    		fileText = fileText.replaceAll("\"", "");

	    		//

				var lines = fileText.trim().split("\r\n");				

				lines.forEach(function(line){

					values = line.split(";");

					var incomeCode = values[14];
					
					if(incomeCode.substring(0, 8) == "17220102"){

						var value = values[15].replaceAll(".", "").replaceAll(",", ".");

						if(parseFloat(value) > 0){

							var monthsDescription = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

							var month = monthsDescription.indexOf(values[4].substring(0, 3).toLowerCase()) + 1;

							if(months.indexOf(month) > -1){

								if(!ipvaTce[month]){
									ipvaTce[month] = 0;
								}

								ipvaTce[month] += parseFloat(value);								

							}

						}

					}

				});

				//

				callback(ipvaTce);

			});

		}else{

			return;

		}

	});

}