let interval: any;
let tempoPomodoroSegundos: number;
let tempoTotalEstudoSegundos: number;
let tempoIntervalo: number;

addEventListener('message', ({ data }) => {
  if (data.action === 'start') {
    tempoPomodoroSegundos = data.tempoPomodoroSegundos;
    tempoTotalEstudoSegundos = data.tempoTotalEstudoSegundos;

    interval = setInterval(() => {
      tempoPomodoroSegundos--;
      tempoTotalEstudoSegundos++;

      if (tempoPomodoroSegundos === 0) {
        clearInterval(interval);
        postMessage('break');
      } else {
        postMessage({ tempoPomodoroSegundos, tempoTotalEstudoSegundos });
      }
    }, 1000);
  } else if (data.action === 'startBreak') {
    tempoIntervalo = data.tempoIntervalo;

    interval = setInterval(() => {
      tempoIntervalo--;

      if (tempoIntervalo === 0) {
        clearInterval(interval);
        postMessage('breakEnd');
      } else {
        postMessage({ tempoIntervalo });
      }
    }, 1000);
  } else if (data.action === 'resumeBreak') {
    tempoIntervalo = data.tempoIntervalo;

    interval = setInterval(() => {
      tempoIntervalo--;

      if (tempoIntervalo === 0) {
        clearInterval(interval);
        postMessage('breakEnd');
      } else {
        postMessage({ tempoIntervalo});
      }
    }, 1000)
  } else if (data.action === 'stop') {
    clearInterval(interval);
    postMessage({ tempoIntervalo});
  } else if (data.action === 'passarSessao') {
    tempoIntervalo = 1;
    tempoPomodoroSegundos = 1;
  } else if (data.action === 'finalizarSessao') {
    tempoTotalEstudoSegundos = 0;
    tempoPomodoroSegundos = data.tempoPomodoroSegundos;
    postMessage({ tempoTotalEstudoSegundos, tempoPomodoroSegundos });
    clearInterval(interval);
  } else if (data.action === 'stopStudy') {
    clearInterval(interval);
    postMessage({ tempoTotalEstudoSegundos, tempoPomodoroSegundos });
  }
});