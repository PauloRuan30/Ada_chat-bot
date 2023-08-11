// Alpine.js initializer
document.addEventListener("alpine:init", () => {
  Alpine.data("layout", () => ({
      profileOpen: false,
      asideOpen: true,
  }));
});

// Use ES6 let and const for variable declarations
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

let can_speech = false;
let baseUrl = "/chatbot/";
let id = 1;

const sugestoes_criar = (sugestoes) => {
  sugestoes.forEach(sugestao => {
    if (sugestao.title) {
      const escolha = sugestao.title;
      const novaSugestao = $('#TEMPLATE_SUGESTAO').clone().attr('id', 'sug_' + id).addClass('botao_sugestao');
      novaSugestao.find('.sugestao').html(escolha);
      novaSugestao.click(() => {
        send(escolha, true);
        $("#texto_usuario").val("");
        $('.botao_sugestao').remove();
      });
      $('#response').append(novaSugestao);
      id++;
    }
  });
  scrollDiv();
}

const cartao_criar = (mensagem, bot) => {
  const novoCartao = bot ? $('#TEMPLATE_BOT').clone() : $('#TEMPLATE_HUMANO').clone();
  novoCartao.attr('id', 'msg_' + id);
  id++;
  mensagem = mensagem || '';
  mensagem = mensagem.replace(/\n/g, "<br />");
  novoCartao.find('.texto').html(mensagem);
  $('#response').append(novoCartao);
}

const fala_bot = (texto) => {
  if (SpeechSynthesis && can_speech) {
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = removelinks(texto);
    SpeechSynthesis.cancel();
    SpeechSynthesis.speak(utterance);
  }
}

const startRecognition = () => {
  recognition = new SpeechRecognition();
  recognition.onstart = () => {
    $('#mic_on').hide();
    $('#mic_off').show();
  };

  recognition.onresult = (event) => {
    let texto = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      texto += event.results[i][0].transcript;
    }
    $("#texto_usuario").val(texto);
    stopRecognition();
    $('#mic_on, #mic_off, #enviar').toggle(texto !== "");
  };

  recognition.onend = () => {
    stopRecognition();
    $('#mic_on, #mic_off, #enviar').toggle($("#texto_usuario").val() !== "");
  };

  recognition.lang = "pt-BR";
  recognition.start();
}

const stopRecognition = () => {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

const linkify = (inputText) => {
  return inputText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    .replace(/(^|[^\/])(www\.[\S]+(\b|$))/g, '$1<a href="http://$2" target="_blank">$2</a>')
    .replace(/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/g, '<a href="mailto:$1">$1</a>');
}

const removelinks = (inputText) => {
  return inputText.replace(/(https?:\/\/[^\s]+)/g, '')
    .replace(/(^|[^\/])(www\.[\S]+(\b|$))/g, '')
    .replace(/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/g, '');
}

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const UUID = uuidv4();

var send = function (texto, gerar_cartao) {

    if (gerar_cartao) {
        cartao_criar(texto, false);
    }

    texto = texto.replace(new RegExp('[ÁÀÂÃ]', 'gi'), 'a');
    texto = texto.replace(new RegExp('[ÉÈÊ]', 'gi'), 'e');
    texto = texto.replace(new RegExp('[ÍÌÎ]', 'gi'), 'i');
    texto = texto.replace(new RegExp('[ÓÒÔÕ]', 'gi'), 'o');
    texto = texto.replace(new RegExp('[ÚÙÛ]', 'gi'), 'u');
    texto = texto.toUpperCase();

    $.ajax({
        type: "POST",
        url: baseUrl + "detect-intent",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
            queryText: texto,
            lang: "pt",
            sessionId: UUID
        }),

        success: function (data) {
            var texto = "";
            var res = data.queryResult.fulfillmentMessages;
            res.forEach(message => {
                if (message.text && message.platform == 'PLATFORM_UNSPECIFIED') {
                    var fragmento = message.text.text[0];
                    if (fragmento) {
                        texto = texto + fragmento + " ";
                        cartao_criar(linkify(fragmento), true);
                        scrollDiv();
                    }
                }
            });
            res.forEach(message => {
                if (message.suggestions && message.suggestions.suggestions) {
                    sugestoes = sugestoes_criar(message.suggestions.suggestions);
                }
            });
            fala_bot(texto);
        },
        error: function (e) {
            cartao_criar("Ocorreu um erro no sistema", true);
        }
    });
    scrollDiv();
}


const scrollDiv = () => {
  const chatContainer = document.getElementById("chatbot"); // Replace "chatbot" with the ID of your chat container
  chatContainer.scrollTop = chatContainer.scrollHeight;
}


$(function () {

    $("#texto_usuario").keyup(function (event) {
        var texto = $("#texto_usuario").val();
        if (texto === "") {
            $('#mic_on').show();
            $('#enviar').hide();
        } else {
            $('#mic_on').hide();
            $('#enviar').show();
        }
    });

    $("#texto_usuario").keypress(function (event) {
        var texto = $("#texto_usuario").val();
        if (event.which == 13) {
            event.preventDefault();
            send(texto, true);
            $("#texto_usuario").val("");
        }
    });

    $("#mic_on").click(function (event) {
        startRecognition();
    });

    $("#mic_off").click(function (event) {
        stopRecognition();
        $('#mic_on').show();
        $('#mic_off').hide();
        $('#enviar').hide();
    });

    $("#enviar").click(function (event) {
        var texto = $("#texto_usuario").val();
        send(texto, true);
        $("#texto_usuario").val("");
        $('#mic_on').show();
        $('#enviar').hide();
    });

    $("#speaker_on").click(function (event) {
        $('#speaker_on').hide();
        $('#speaker_off').show();
        can_speech = false;
        SpeechSynthesis.cancel();
    });

    $("#speaker_off").click(function (event) {
        $('#speaker_on').show();
        $('#speaker_off').hide();
        can_speech = true;
    });

    if (SpeechRecognition) {
        $('#mic_on').show();
    }

    if (speechSynthesis) {
        $('#speaker_off').show();
    }

    send("Oi", false);
});