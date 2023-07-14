// Esperar a que se cargue completamente el contenido de la página
window.addEventListener('DOMContentLoaded', function () {
  // Obtener referencias a los elementos del DOM
  const textarea = document.getElementById('Textarea');
  const textarea1 = document.getElementById('Textarea1');
  const evaluateBtn = document.getElementById('evaluate-btn');
  const clearBtn = document.getElementById('clear-btn');
  const radioButtons = document.querySelectorAll('input[name="btnradio"]');
  // Agregar un evento de clic al botón "Evaluar"
  evaluateBtn.addEventListener('click', evaluarExpresion);
  // Agregar un evento de clic al botón "Limpiar"
  clearBtn.addEventListener('click', limpiar);
  // Función para evaluar la expresión
  function evaluarExpresion() {
    let expression = textarea.value.trim();
    if (expression != "") {
      if (expression.includes(".")) {
        expression = convertirALenguajeSimbolico(expression);
      }
      const truthTable = generateTruthTable(expression);
      textarea1.value = truthTable;
      evaluarTipo(truthTable);
    }
  }
  // Función para restablecer los valores al estado inicial
  function limpiar() {
    textarea.value = '';
    textarea1.value = '';
    radioButtons.forEach(function (button) {
      button.checked = false;
    });
  }
  // Función para generar la tabla de verdad
  function generateTruthTable(expression) {
    const variables = getVariables(expression);
    const headers = [...variables, expression];
    const numVariables = variables.length;
    const numCombinations = Math.pow(2, numVariables);
    let table = '';
    for (let i = 0; i < numCombinations; i++) {
      const binary = (numCombinations - 1 - i).toString(2).padStart(numVariables, '0');
      const variableValues = binary.split('').map(bit => bit === '1');
      const row = '| ' + variableValues.map(value => value ? 'V' : 'F').join(' | ') + ' |';
      const result = evaluateExpression(expression, variables, variableValues);
      table += row + (result ? ' V ' : ' F ') + ' |\n';
    }
    const separator = '-'.repeat(headers.join(' | ').length + 1);
    table = separator + '\n| ' + headers.join(' | ') + ' |\n' + separator + '\n' + table + separator;
    return table;
  }
  // Función para obtener las variables de la expresión
  function getVariables(expression) {
    const regex = /\b[A-Za-z]+\b/g;
    const variables = expression.match(regex) || [];
    return [...new Set(variables)];
  }
  function evaluateExpression(expression, variables, variableValues) {
    const evaluatedExpression = expression.replace(/\b([A-Za-z]+)\b/g, (_, variable) => {
      const index = variables.indexOf(variable);
      return variableValues[index] ? 'true' : 'false';
    });
    const operators = {
      '&&': (a, b) => a && b,
      '||': (a, b) => a || b,
      '!': a => !a,
      '->': (a, b) => !a || b,
      '<=>': (a, b) => (a && b) || (!a && !b)
    };
    let result = evaluatedExpression.replace(/\b(\w+)\b/g, (_, operator) => {
      return operators[operator] ? operators[operator] : operator;
    });
    // Evaluar las negaciones
    result = result.replace(/!(true|false)/g, (_, a) => {
      return operators['!'](a === 'true') ? 'true' : 'false';
    });
    // Evaluar las implicaciones recursivamente
    while (result.includes("->")) {
      result = result.replace(/(true|false) *-> *(true|false)/g, (_, a, b) => {
        return operators['->'](a.trim() === 'true', b.trim() === 'true') ? 'true' : 'false';
      });
    }
    // Evaluar las equivalencias recursivamente
    while (result.includes("<=>")) {
      result = result.replace(/(true|false) *<=> *(true|false)/g, (_, a, b) => {
        return operators['<=>'](a.trim() === 'true', b.trim() === 'true') ? 'true' : 'false';
      });
    }
    let finalResult;
    try {
      finalResult = eval(result);
    } catch (error) {
      finalResult = false; // Manejar errores de evaluación
    }
    return finalResult;
  }
  // Función para evaluar el tipo de la expresión (tautología, contradicción o contingencia)
  function evaluarTipo(truthTable) {
    const rows = truthTable.trim().split('\n');
    const columnValues = [];
    for (let i = 2; i < rows.length - 1; i++) {
      if (i != 2) {
        const row = rows[i];
        const cells = row.split('|').map(value => value.trim());
        const penultimateCell = cells[cells.length - 2];
        columnValues.push(penultimateCell);
      }
    }
    if (columnValues.includes('V') && columnValues.includes('F')) {
      document.getElementById('Contingencia').checked = true;
    } else if (columnValues.includes('V') && !columnValues.includes('F')) {
      document.getElementById('Tautología').checked = true;
    } else if (!columnValues.includes('V') && columnValues.includes('F')) {
      document.getElementById('Contradicción').checked = true;
    }
  }
  var arregloLetras = [['A', ''], ['B', ''], ['C', ''], ['E', ''], ['F', ''], ['G', ''], ['H', ''], ['J', ''], ['K', ''], ['L', ''], ['M', ''], ['O', ''], ['P', ''], ['Q', ''], ['R', ''], ['S', ''], ['T', ''],];
  let simbolo = [' ! ', ' || ', ' && ', ' -> ', ' <=> '];
  function convertirALenguajeSimbolico(oracion) {
    // Remplazar las palabras clave por los símbolos correspondientes
    oracion = oracion.replace(/ si y solo si /gi, ' <=> ');
    oracion = oracion.replace(/ entonces /gi, ' -> ');
    oracion = oracion.replace(/ y /gi, ' && ');
    oracion = oracion.replace(/ o /gi, ' || ');
    oracion = oracion.replace(/ no /gi, ' ! ');
    oracion = oracion.replace(/Si /gi, '');
    let premisa = "";
    let resultado = "";
    for (var i = 0; i <= oracion.length; i++) {
      for (var j = 0; j < simbolo.length; j++) {
        if (premisa.includes(simbolo[j])) {
          resultado += generarLetra(premisa) + " " + simbolo[j];
          premisa = "";
        } else if (premisa.includes(".")) {
          resultado += generarLetra(premisa);
          premisa = "";
        }
        if (premisa.includes("!")) {
          premisa = "";
          resultado += "!";
        }
      }
      premisa += oracion[i];
    }
    return resultado;
  }
  function generarLetra(premisa) {
    let letra = "";
    let auxPremisa = "";
    premisa = premisa.replace(/\./gi, '');
    premisa = premisa.replace(/\,/gi, '');
    if (premisa !== "") {
      premisa = eliminarSimbolosYEspacios(premisa);
    }
    for (var i = 0; i < arregloLetras.length; i++) {
      if (premisa == arregloLetras[i][1]) {
        letra = arregloLetras[i][0];
        arregloLetras[i][1] = premisa;
        break; // Termina el bucle una vez que encuentra la letra correspondiente
      }
    }
    if (letra === "") {
      for (var i = 0; i < arregloLetras.length; i++) {
        if (arregloLetras[i][1] === "") {
          letra = arregloLetras[i][0];
          arregloLetras[i][1] = premisa;
          break; // Termina el bucle una vez que encuentra una posición vacía
        }
      }
    }
    return letra;
  }
  function eliminarSimbolosYEspacios(premisa) {
    if (premisa === undefined) {
      return '';
    }
    for (var i = 0; i < simbolo.length; i++) {
      premisa = premisa.split(simbolo[i]).join("");
    }
    premisa = premisa.replace(/\s+/g, "");
    return premisa;
  }
});