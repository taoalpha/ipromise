currentp = null;
historyp = null;
temp = {};
minutes=1000*60;
hours=minutes*60;
days=hours*24;
years=days*365;
storage = chrome.storage.local;
$(document).ready(function(){
    showquotes();
    setTimeout(function() {
        storage.get("currentpromise", function(data) {
            if(data.currentpromise){
                $('div.loading').fadeOut(500).siblings('div.cupromise').fadeIn(800);
                showcur(data.currentpromise);
            }else{
                $('div.loading').fadeOut(500).siblings('div.addpromise').fadeIn(800);
            }
        });
    }, 3000);
    // TODO: optimize the date picker
    $('#datetimepicker').datetimepicker({
      format: 'yyyy-MM-dd hh:mm:ss',
      language: 'pt-BR'
    });
    $('div.helpuse').on('click',function(){
      $(this).hide();
      $('#newpromise').css('display','block')
    });
    $('div.save').on('click',function(){
        var cupromise = {};
        cupromise.content = $('textarea').val();
        cupromise.addtime = new Date();
        cupromise.deadline = $('input#theddl').val().replace(" ","T");
        if(cupromise.deadline == ""){showpop('invalid date');return};
        if(Date.parse(cupromise.deadline)-Date.parse(Date()) >= (1000*60*60*24*5)){showpop('Your deadline should be in 5 days from now on.');return};
        if(Date.parse(cupromise.deadline)-Date.parse(Date()) <= 0){showpop('Your deadline must be later than now.');return};
        storage.set({"currentpromise":cupromise}, function() {
            console.log('saved to currentpromise.')
        });
        $('div.addpromise').fadeOut(800).siblings('div.cupromise').fadeIn(800);
        showcur(cupromise);
    });
    // DONE: log some information for checkbox in localstorage.
    $('div.showpromise').on('click','input',function(){
      var mark = ($(this).prop('checked'))?1:0;
      var imark = $('input').index($(this));
      storage.get("marks", function(data) {
        if(Object.keys(data).length==0){
          data[imark] = mark;
          storage.set({"marks":data});
        }else{
          // console.log(data);
          data['marks'][imark] = mark;
          storage.set({"marks":data.marks});
        }
      })
    });
    // mark done
    $('div.mdone').on('click',function(){
        storage.get("currentpromise", function(data) {
            kk = data.currentpromise;
            if(Date.parse(kk.deadline)-Date.parse(Date())>=0){
                kk.status = "done";
            }else{
                kk.status = "delay";
            }
            kk.closetime = Date();
            storage.get("historypromise", function(data2) {
                var his = data2.historypromise;
                if(his == null){his = []};
                his.push(kk);
                storage.set({"historypromise":his}, function() {
                    console.log('saved to history.')
                    storage.remove("currentpromise", function() {
                        console.log('removed the current.')
                        $('div.cupromise').fadeOut(500).siblings('div.addpromise').fadeIn(800);
                    });
                });
            });
        });
        storage.remove("marks");
    });
    $('div.sorry').on('click',function(){
        storage.get("currentpromise", function(data) {
            var kk = data.currentpromise;
            kk.status = "fail";
            kk.closetime = Date();
            storage.get("historypromise", function(data2) {
                var his = data2.historypromise;
                if(his == null){his = []};
                his.push(kk);
                storage.set({"historypromise":his}, function() {
                    console.log('saved to history.')
                    storage.remove("currentpromise", function() {
                        console.log('removed the current.')
                        $('div.cupromise').fadeOut(500).siblings('div.addpromise').fadeIn(800);
                    });
                });
            });
        });
        storage.remove("marks");
    });
    $('div.cupromise').on('click','div.right,div.left',function(){
        $('div.cupromise').fadeOut(500).siblings('div.oldpromise').fadeIn(800);
        showhis();
    });
    $('div.oldpromise').on('click','div.right,div.left',function(){
        storage.get("currentpromise", function(data) {
            if(data.currentpromise){
                $('div.oldpromise').fadeOut(500).siblings('div.cupromise').fadeIn(800);
            }else{
                $('div.oldpromise').fadeOut(500).siblings('div.addpromise').fadeIn(800);
            }
        });
    });
    $('div.addpromise').on('click','div.right,div.left',function(){
        storage.get("currentpromise", function(data) {
            if(data.currentpromise){
                $('div.addpromise').fadeOut(500).siblings('div.cupromise').fadeIn(800);
            }else{
                $('div.addpromise').fadeOut(500).siblings('div.oldpromise').fadeIn(800);
                showhis();
            }
        });
    });
    $('div.clear').on('click',function(){
        storage.remove("historypromise", function() {
            console.log('Cleared all histories.')
            showhis();
        });
    });
    setInterval(function() {
        storage.get("currentpromise", function(data) {
            if(data.currentpromise){
                showcur(data.currentpromise);
            }else{
                return
            }
        });
    },60000);
});
function showcur(kk){
    // parse some special formation:
    if(kk.content.indexOf("MD:")==0){
      var converter = new Markdown.Converter(),
          markdownToHtml = converter.makeHtml;
      $('div.showpromise').html(markdownToHtml(kk.content.replace("MD:","")));
    }else{
      $('div.showpromise').html(kk.content.replace(/\n/g,"\<br\>"));
    }
    $('div.ddl span.time').text(kk.deadline);
    var remaintime =Date.parse(kk.deadline)-Date.parse(Date());
    if(remaintime>3*days){
        flag = "long";
    }else if(remaintime>2*days){
        flag = "twoday";
    }else if(remaintime>1*days){
        flag = "oneday";
    }else if(remaintime>12*hours){
        flag = "halfday";
    }else if(remaintime>0){
        flag = "soon";
    }else if(remaintime<0){
        flag = "fail";
        remaintime =  Math.abs(remaintime);
    }
    showthis(remaintime,flag);
}
function showthis(remaintime,flag){
    $('div.remain span.time').html("<b class="+flag+">"+Math.floor(remaintime/days) + "days " + Math.floor((remaintime-(Math.floor(remaintime/days))*days)/hours) + "hours " + Math.floor((remaintime-(Math.floor(remaintime/hours))*hours)/minutes)+"mins</b>");
    showmarks();
}
// show marks after load all data
function showmarks(){
    storage.get("marks", function(data) {
      $.each(data.marks,function(i,v){
          $('input').eq(parseInt(i)).prop('checked',((v==1)? true:false));
      });
    })
}
function showhis(){
    $('ul.items').empty();
    storage.get("historypromise", function(data) {
        var his = data.historypromise;
        var savedtime = 0;
        if(his != null){
            $.each(his,function(index,value){
              // remove the 'MD:' for summary
                var summ = value.content.split("\n")[0];
                if(value.content.indexOf("MD:")==0){
                    summ = value.content.split("\n")[1];
                }
                $('ul.items').append("<li class="+value.status+"><span>"+value.closetime.split("GMT")[0]+"</span><span>"+value.status+"</span><div class="+value.status+"></div><div class=summary>"+summ+"</div></li>");
                if(value.status == 'done' || value.status == 'delay'){
                    savedtime = savedtime +  Date.parse(value.deadline)-Date.parse(value.closetime);
                }
            });
        }
        $('div.savetime').find('span').text(Math.floor(savedtime/(1000*3600*24))+"days");
    });
}

function showpop(mes){
    $.blockUI({
        message: mes,
        css: {
            left:'15%',
            width:'180px',
            border: 'none',
            padding: '5px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .95,
            font:'22px arial',
            color: 'red'
        }
    });
    setTimeout($.unblockUI, 2000);
}
function showquotes(){
    storage.get("dailyquote", function(data) {
        if(data.dailyquote && (Date.parse(Date())-Date.parse(data.dailyquote.gettime))<days){
            var quote = data.dailyquote;
            $('span.quote').html(quote.contents.quote);
            $('span.author').html(quote.contents.author);
        }else{
            $.get("http://api.theysaidso.com/qod.json",function(data){
                quote = data;
                quote.gettime = (new Date()).toDateString();
                $('span.quote').html(quote.contents.quote);
                $('span.author').html(quote.contents.author);
                storage.set({"dailyquote":quote}, function() {
                    return 1
                });
            })
        }
    });
}
