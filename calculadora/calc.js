//=======================================================================================================================
// Corregir estos valores!
var inflacion = 1.4787;     // Factor por el cual se multiplica la escala de salarios con respecto al 2do.semestre de 2018
var factorCorte = 1.1;     // Hasta que manden los rangos superiores, se estima el corte para medio Alto y Alto
//=======================================================================================================================

var ingresos = 0;
var g_data;  // todos los datos del .tsv
//var aglomerado_seleccionado="1"; // aglomerado seleccionado
//var hogar_seleccionado = "1";  // habitantes por hogar (1 o mas)
var datos_filtrados;     // g_data filtrada segun aglomerado y hogar


function update_data(aglomerado_sel,hogar_sel) {
  console.log("update data..." + aglomerado_sel + "-" + hogar_sel);
  datos_filtrados = g_data.filter(d => (d.cod_aglomerado == aglomerado_sel && d.hogar == hogar_sel));
}


function calsif(smvm) {
  if (smvm <0.5) {
  	return "Indigente";
  } else if (smvm >= 0.5 && smvm < 1){
  	return "Pobre no indigente";
  } else if (smvm >= 1 && smvm < 2){
  	return "Media Baja";
  } else if (smvm >= 2 && smvm < 4){
  	return "Media Plena";
  } else if (smvm >= 4 && smvm < 16){
  	return "Media Alta";
  } else if (smvm > 16){
  	return "Alta";
  }

}




d3.tsv( "eph.tsv" )
  .then(function(data) {
    data.forEach(function(d) {
      d.maximo = +d.maximo;
	  d.minimo = +d.minimo;
	  d.SMVM   = +d.SMVM;
    });
    console.log( data[0] );
    g_data = data;


  })
  .catch(function(error){
     console.log(error);
  })


function calc() {
  var ingresos = +d3.select("#ingresos").property("value");
  var aglomerado_sel = +d3.select("#aglomerado").property("value");
  var hogar_sel = +d3.selectAll('input[name="hogar"]:checked').property("value");

  var desierto = 1;
  var max_salario = 0;

  update_data(aglomerado_sel,hogar_sel);


  datos_filtrados.forEach(function(d) {
	  	if ((inflacion * d.minimo <= ingresos) && (ingresos < inflacion * d.maximo)) {
			d3.select("div#resultado").html("");

			d3.select("div#resultado").append("p").html( "<h4>Con un ingreso de <span class='grande'>$" + ingresos.toLocaleString() +
			"</span> es clase <span class='grande'>" + calsif(d.SMVM) +
			"</span> </h4> <h6><br>Esta en el grupo decílico <span class='grande'>" +
			d.grupo + "</span> con una brecha del SMVM de <span class='grande'>" + d.SMVM  +
			"</span></h6>" );

			console.log(d.minimo*inflacion, d.maximo*inflacion, "grupo: ", d.grupo, d.SMVM);
			desierto = 0;
  		}
			max_salario = d.maximo;
  })
  // Hasta que manden los rangos superiores, se estima
  if (desierto==1) {
  	console.log("Fuera de rango. Corte: ", (inflacion * max_salario) *factorCorte);

  	if (ingresos < (inflacion * max_salario) *factorCorte) {
			d3.select("div#resultado").html("");
			d3.select("div#resultado").append("p").html( "<h4>Con un ingreso de <span class='grande'>$" + ingresos.toLocaleString() +
			"</span> es clase <span class='grande'>" + "Media Alta</span></h4> <h6><br>Supera el grupo decílico máximo</h6>");
  	} else {
			d3.select("div#resultado").html("");
			d3.select("div#resultado").append("p").html( "<h4>Con un ingreso de <span class='grande'>$" + ingresos.toLocaleString() +
			"</span> es clase <span class='grande'>" + "Alta</span></h4> <h6><br>Supera el grupo decílico máximo</h6>");

  	}
  }
  d3.select("div#referencia").html("");
  d3.select("div#referencia").append("p").html( "SMVM Septiembre 2019 - $15625" );
}

