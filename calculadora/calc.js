//=======================================================================================================================
// Corregir estos valores!
var inflacion = 1.4787;     // Factor por el cual se multiplica la escala de salarios con respecto al 2do.semestre de 2018
var factorCorte = 1.1;     // Hasta que manden los rangos superiores, se estima el corte para medio Alto y Alto
//=======================================================================================================================

var ingresos = 0;
var g_data;  // todos los datos del .tsv
var aglomerado_seleccionado="1"; // aglomerado seleccionado
var hogar_seleccionado = "1";  // habitantes por hogar (1 o mas)
var datos_filtrados;     // g_data filtrada segun aglomerado y hogar

function update_aglomerado(index) {
  console.log("update aglomerado..." + index);
  datos_filtrados = g_data.filter(d => (d.cod_aglomerado == index && d.hogar == hogar_seleccionado));
}

function update_hogar(index) {
  console.log("update hogar..." + index);
  datos_filtrados = g_data.filter(d => (d.cod_aglomerado == aglomerado_seleccionado && d.hogar == index));
}

function calsif(smvm) {
  console.log("clasif..." + smvm);

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


  datos_filtrados = g_data.filter(d => (d.cod_aglomerado == index && d.hogar == hogar_seleccionado));
}



d3.select("#aglomerado")
	.on("change", function(d) {
		aglomerado_seleccionado = this.value;
		console.log(aglomerado_seleccionado);
		update_aglomerado(aglomerado_seleccionado);
	})


d3.selectAll('input[type="radio"]')
	.on("change",function(d){
		hogar_seleccionado = this.value;
		console.log(hogar_seleccionado);
		update_hogar(hogar_seleccionado);
  	})


d3.tsv( "eph.tsv" )
  .then(function(data) {
    data.forEach(function(d) {
      d.maximo = +d.maximo;
	  d.minimo = +d.minimo;
	  d.SMVM   = +d.SMVM;
    });
    console.log( data[0] );
    g_data = data;
    //Carga los datos filtrados por primera vez
    update_hogar(hogar_seleccionado);


  })
  .catch(function(error){
     console.log(error);
  })


function calc() {
  var ingresos = +d3.select("#ingresos").property("value");
  var desierto = 1;
  var max_salario = 0;
  datos_filtrados.forEach(function(d) {
	  	if ((inflacion * d.minimo <= ingresos) && (ingresos < inflacion * d.maximo)) {
			d3.select("div#resultado").html("");

			d3.select("div#resultado").append("p").html( "<h4>Con un ingreso de <span class='grande'>$" + ingresos +
			"</span> es clase <span class='grande'>" + calsif(d.SMVM) +
			"</span> </h4> <h6><br>Esta en el grupo decílico <span class='grande'>" +
			d.grupo + "</span> con una brecha del SMVM de <span class='grande'>" + d.SMVM  +
			"</span></h6>" );

			console.log(d.minimo*inflacion, d.maximo*inflacion, "en este grupo: ", d.grupo, d.SMVM);
			desierto = 0;
  		}
			max_salario = d.maximo;
  })
  // Hasta que manden los rangos superiores, se estima
  if (desierto==1) {
  	console.log((inflacion * max_salario) *factorCorte);

  	if (ingresos < (inflacion * max_salario) *factorCorte) {
			d3.select("div#resultado").html("");
			d3.select("div#resultado").append("p").html( "<h4>Con un ingreso de <span class='grande'>$" + ingresos +
			"</span> es clase <span class='grande'>" + "Media Alta</span></h4> <h6><br>Supera el grupo decílico máximo</h6>");
  	} else {
			d3.select("div#resultado").html("");
			d3.select("div#resultado").append("p").html( "<h4>Con un ingreso de <span class='grande'>$" + ingresos +
			"</span> es clase <span class='grande'>" + "Alta</span></h4> <h6><br>Supera el grupo decílico máximo</h6>");

  	}
  }
  d3.select("div#referencia").html("");
  d3.select("div#referencia").append("p").html( "SMVM Septiembre 2019 - $15625" );
}

