// storage=chrome.storage.local;
currentp = null;
historyp = null;
temp = {};
minutes=1000*60;
hours=minutes*60;
days=hours*24;
years=days*365;
$(document).ready(function(){
    showquotes();
    setTimeout(function() {
        chrome.storage.local.get("currentpromise", function(data) {
            if(data.currentpromise){
                $('div.loading').fadeOut(500).siblings('div.cupromise').fadeIn(800);
                showcur(data.currentpromise);
            }else{
                $('div.loading').fadeOut(500).siblings('div.addpromise').fadeIn(800);
            }
        });
    }, 6000);
    $('div.setddl').on('click',function(){
        $('span.settext').text("");
        $('input#theddl').show();
    });
    $('div.save').on('click',function(){
        var cupromise = {};
        cupromise.content = $('textarea').val();
        cupromise.addtime = new Date();
        cupromise.deadline = $('input#theddl').val();
        if(cupromise.deadline == ""){showpop('invalid date');return};
        if(Date.parse(cupromise.deadline)-Date.parse(Date()) >= (1000*60*60*24*5)){showpop('Your deadline should be in 5 days from now on.');return};
        if(Date.parse(cupromise.deadline)-Date.parse(Date()) <= 0){showpop('Your deadline must be later than now.');return};
        chrome.storage.local.set({"currentpromise":cupromise}, function() {
            console.log('saved to currentpromise.')
        });
        $('div.addpromise').fadeOut(800).siblings('div.cupromise').fadeIn(800);
        showcur(cupromise);
    });
    $('div.mdone').on('click',function(){
        chrome.storage.local.get("currentpromise", function(data) {
            kk = data.currentpromise;
            if(Date.parse(kk.deadline)-Date.parse(Date())>=0){
                kk.status = "done";
            }else{
                kk.status = "delay";
            }
            kk.closetime = Date();
            chrome.storage.local.get("historypromise", function(data2) {
                var his = data2.historypromise;
                if(his == null){his = []};
                his.push(kk);
                chrome.storage.local.set({"historypromise":his}, function() {
                    console.log('saved to history.')
                    chrome.storage.local.remove("currentpromise", function() {
                        console.log('removed the current.')
                        $('div.cupromise').fadeOut(500).siblings('div.addpromise').fadeIn(800);
                    });
                });
            });
        });
    });
    $('div.sorry').on('click',function(){
        chrome.storage.local.get("currentpromise", function(data) {
            var kk = data.currentpromise;
            kk.status = "fail";
            kk.closetime = Date();
            chrome.storage.local.get("historypromise", function(data2) {
                var his = data2.historypromise;
                if(his == null){his = []};
                his.push(kk);
                chrome.storage.local.set({"historypromise":his}, function() {
                    console.log('saved to history.')
                    chrome.storage.local.remove("currentpromise", function() {
                        console.log('removed the current.')
                        $('div.cupromise').fadeOut(500).siblings('div.addpromise').fadeIn(800);
                    });
                });
            });

        });
    });
    $('div.cupromise').on('click','div.right,div.left',function(){
        $('div.cupromise').fadeOut(500).siblings('div.oldpromise').fadeIn(800);
        showhis();
    });
    $('div.oldpromise').on('click','div.right,div.left',function(){
        chrome.storage.local.get("currentpromise", function(data) {
            if(data.currentpromise){
                $('div.oldpromise').fadeOut(500).siblings('div.cupromise').fadeIn(800);
            }else{
                $('div.oldpromise').fadeOut(500).siblings('div.addpromise').fadeIn(800);
            }
        });
    });
    $('div.addpromise').on('click','div.right,div.left',function(){
        chrome.storage.local.get("currentpromise", function(data) {
            if(data.currentpromise){
                $('div.addpromise').fadeOut(500).siblings('div.cupromise').fadeIn(800);
            }else{
                $('div.addpromise').fadeOut(500).siblings('div.oldpromise').fadeIn(800);
                showhis();
            }
        });
    });
    $('div.clear').on('click',function(){
        chrome.storage.local.remove("historypromise", function() {
            console.log('Cleared all histories.')
            showhis();
        });
    });
    setInterval(function() {
        chrome.storage.local.get("currentpromise", function(data) {
            if(data.currentpromise){
                showcur(data.currentpromise);
            }else{
                return
            }
        });
    },60000);
});
function showcur(kk){
    $('div.showpromise').html(kk.content.replace(/\n/g,"\<br\>"));
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
}
function showhis(){
    $('ul.items').empty();
    chrome.storage.local.get("historypromise", function(data) {
        var his = data.historypromise;
        var savedtime = 0;
        if(his != null){
            $.each(his,function(index,value){
                var summ = value.content.split("\n")[0];
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
    chrome.storage.local.get("dailyquote", function(data) {
        if(data.dailyquote && (Date.parse(Date())-Date.parse(data.dailyquote.gettime))<days){
            var quote = data.dailyquote;
            $('span.quote').html(quote.contents.quote);
            $('span.author').html(quote.contents.author);
        }else{
            $.get("http://api.theysaidso.com/qod.json",function(data){
                quote = data;
                quote.gettime = new Date();
                $('span.quote').html(quote.contents.quote);
                $('span.author').html(quote.contents.author);
                chrome.storage.local.set({"dailyquote":quote}, function() {
                    return 1
                });
            })
        }
    });
}
