// ==UserScript==
// @name         Fix Reactor
// @version      0.4.4
// @description  ...
// @author       Borgulio
// @include      *reactor.cc*
// @include      *joyreactor.cc*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    let $ = window.jQuery;

    /* Changelog
    0.4.4 (01.09.2021)      • Очередной раз вернул document-idle, нет идей как пофиксить ломающиеся длиннопосты самого реактора
                              Закомментил addEventListener("DOMContentLoaded"
                              Стили вернул в $("head").append вместо $("head").after
                            • jQuery 3.5.1 -> 3.6.0
                            • Небольшие правки CSS, убрал немного лишнего, обновил скрытие отступов до и после картинов в посте.
                            • Добавил иконки на кнопки "подписаться\отписаться\заблокировать\разблокировать" в HideTagInfo(),
                              в плане читаемости кода выглядит еще более отвратительно, чем раньше, просто кошмар.

    0.4.3 (03.09.2020)      • В RemoveEmptySpace() добавил доп проверку else if так как увидел пустую строку в этом NSFW посте pokemon.reactor.cc/post/4489616
                              Hotfix - объединил в одно общее условие, теперь поиск через lastIndexOf, а замена через substr
                              Предыдущие условия пока оставил там же, добавил только false, чтобы не срабатывали

    0.4.2 (19.05.2020)      • Немного переделал AddScrollTopButton()
                            • Переделка анонимных функций в стрелочные и немного сжал код в некоторых местах, например RemoveShareButtons() и некоторые toggle.
                              Скорее всего это негативно скажется на читаемости, но пока кода мало и вроде как все понятно.
                            • Хотелось бы избавиться от мигания при загрузке сайта. Для этого тестирую document-start вместо document-idle, соответственно стили в
                              AddNewCSS() теперь добавляются после head. Добавлен евент лисенер для всех основных функций.
                              Если будут проблемы(а раньше вроде были), то придется делать индивидуальную настройку каждой функции, либо откатываться назад.

    0.4.1 (19.05.2020)      • Чистка от ненужных комментариев и консоль логов, замена var на let
                            • Объединил ChangeLinks() и ObserverChangeLinks() в один ChangeLinks(), обсервер переделан
                            • Переделал ColorMadness(), добавил собственный обсервер, в прошлой версии я запихнул его в ObserverChangeLinks() и забыл написать об этом.
                              Имхо такое себе решение пихать кучу постоянно мониторящих обсов,но варианта лучше я пока придумать не могу
                            • Обновлен jquery 3.4.1 -> 3.5.1
                            • Переписал AddScrollTopButton()

    0.3.10 (18.07.2019)     • RemoveEmptySpace никогда не закончится, выскочил пост с &nbsp; в конце, добавлено обнаружение и выпиливание
                            • Вернул changelog
                            • Переименовал BackAndForwardButtons в NextAndPreviousPageButtons
                            • Добавлен новый css - .post_rating для уменьшения размера шрифта рейтинга
                            • Цветное Безумие! Новая функция ColorMadness специально для цветных. Выпилены все кастомные цвета, шрифты и огромные буквы,
                              НО вместо этого все они теперь одного оранжево-коричневого цвета, который не так раздражает

    0.3.9 (01.07.2019)      • И опять RemoveEmptySpace переписан полностью, добавлены функции q и qq, чтобы не прописывать console.log постоянно
                            • Небольшие косметические изменения самого скрипта

    0.3.7 (17.06.2019)      • Улучшение читаемости скрипта, изменение id добавляемых элементов

    0.3.5 (15.06.2019)      • Зачем-то обновлен jquery 3.3.1 -> 3.4.1
                            • Запуск скрипта document-start -> document-idle из за чего был убран ивент лисенер на загрузку dom и таймаут на запуск всех функций
                            • Css вернул обратно в head

    0.3.5 (14.06.2019)      • Опять RemoveEmptySpace

    0.3.4 (14.06.2019)      • Очередная попытка переписать RemoveEmptySpace, добавил комментом ссылки на примеры постов с отсупами
                            • Переписаны //ABYSS LINK MOVE и //USER PAGE: COMMENTS LINK MOVE - теперь не перебором всех ссылок на сайте
                            • Подправлен //DESCRIPTION MOVE
                            • Добавлен новый css - .post_content_expand - убран бесполезный отступ от поста
                            • Зачем-то убрал changelog

    0.3.3 (12.02.2019)      • Убрал base64 #taginfo background, добавил кнопки вперед-назад сверху страницы в #contentinner, #contentinner position добавлен в css

    0.3.2                   • Задержка функций увеличена с 1 до 8

    0.3.1                   • Css устанавливается после 'head'(поставил after вместо append)
    */

    AddMainCss();
    AddHideCss();

    //document.addEventListener("DOMContentLoaded", () => {
        RemoveEmptySpace(); /* remove empty space after pics.
        http://anime.reactor.cc/post/3968565
        http://anime.reactor.cc/post/3970379
        http://reactor.cc/post/3971232
        http://anime.reactor.cc/post/3965275
        http://reactor.cc/post/4010095        <---- NSFW!
        */
        AddPostButton();
        AddMenuButton();
        MoveElements(); //перенос строки поиска, ссылки на бездну, ссылки на коменты юзера и фраз "Деменция и фундаментализм" и т.д.
        AddScrollTopButton();
        RemoveShareButtons();
        HideTagInfo(); //Шапка тега занимает кучу места на экране, но при этом не требуется на постоянной основе. Скрываем и заменяем на простые кнопки
        ChangeLinks();
        NextAndPreviousPageButtons(); //кнопки вперед-назад сверху страницы в #contentinner
        ColorMadness();
    //});


    //========================== Functions ==========================//
    function ColorMadness(){
        function uncolor(){
            $('.postContainer, .post_comment_list').find('font[color], font[size]').each(function(){
                $(this).removeAttr('size').removeAttr('face').removeAttr('color').css('color','#c17d00');
                $(this).find('b').each(function(){
                    $(this).replaceWith($(this).contents());
                });
                if ( $(this).parent().is('b') ) {
                    $(this).parent().replaceWith($(this).parent().contents());
                }
            });
        }

        uncolor();

        //Observer
        let target = $('.post_comment_list');
        let config = { childList: true, subtree: true };
        let observer = new MutationObserver( mutations => uncolor() );

        target.each( (index, element) => observer.observe(element, config) );
    }


    function NextAndPreviousPageButtons(){
        $('#contentinner > #post_list').prepend('<div id="brg_NextAndPreviousPageButtons" style="position: absolute; right: -17px; z-index: 100; text-align: right;"></div>');
        $('<br><br>').appendTo('#brg_NextAndPreviousPageButtons');
        $('#Pagination').find('a.prev').clone().css({ 'padding': '0 5px 0 5px' }).appendTo('#brg_NextAndPreviousPageButtons');
        $('<br><br>').appendTo('#brg_NextAndPreviousPageButtons');
        $('#Pagination').find('a.next').clone().css({ 'padding': '0 5px 0 5px' }).appendTo('#brg_NextAndPreviousPageButtons');
    }


    function ChangeLinks(){
        $('a.top_logo').attr('href','/all');
        $('a[href*=joyreactor]').each(function(){
            let NewLink = $(this).attr("href").replace("joyreactor", "reactor");
            $(this).attr("href", NewLink);
        });

        //Observer
        let target = $('.post_comment_list');
        let config = { childList: true, subtree: true };
        let observer = new MutationObserver( mutations => {
            for(let mutation of mutations){
                for(let node of mutation.addedNodes){
                    if (!$(node).hasClass('comment_list_post')) continue;
                    let ReplacedHtml = $(node).html().replace(/:\/\/joyreactor/g, '://reactor');
                    $(node).html( ReplacedHtml );
                }
            }
        });

        target.each( (index, element) => observer.observe(element, config) );
    }


    function HideTagInfo(){
        //    #tagArticle прячется через css
        if ( !~location.href.indexOf('/tag/') ) return;
        // ADD TAG INFO BUTTON
        $('#contentinner').prepend('<button id="brg_TagInfo" onclick="return false">Tag Info</button>');
        $('#brg_TagInfo').css({'position': 'absolute',
                               'width': '35px',
                               'left': '-36px',
                               'border-radius': '21px',
                               'outline': 'none',
                               'font-size': '9px',
                               'padding': '0 0 0 0'});
        $('#brg_TagInfo').click( () => $('#tagArticle, #brg_TagFavouriteButtons').toggle(100) );

        //CREATE NEW SMALL BLOCK
        $('#brg_TagInfo').after('<div id="brg_TagFavouriteButtons" style="border-bottom: 2px solid #FDDA97; overflow: hidden"></div>');

        //tag chain
        $('#breadCrumb').find('div.sideheader.taginfo').clone().css({ 'margin-left':'5px', 'font-weight':'bold' }).appendTo('#brg_TagFavouriteButtons');

        //ADD TO FAV
        $('#blogFavroiteLinks').find('.add_to_fav').clone().css({'float':'left',
                                                                 'margin':'2px 15px 2px 20px',
                                                                 'text-transform':'capitalize'
                                                                }).appendTo('#brg_TagFavouriteButtons')
            .find('a').html('<p style="font-weight: bold; float: left; font-size: 35px; vertical-align: top; line-height: 18px; margin: 0;">+</p>подписаться');

        //REMOVE FROM FAV
        $('#blogFavroiteLinks').find('.remove_from_fav').clone().css({'float':'left',
                                                                      'margin':'2px 15px 2px 20px',
                                                                      'text-transform':'capitalize'
                                                                     }).appendTo('#brg_TagFavouriteButtons')
            .find('a').css({'background': 'transparent url(http://js.reactor.cc/images/remove_icon_small.png) no-repeat 0 3px',
                            'padding-left':'16px'
                           });

        //BLOCK TAG
        $('#blogFavroiteLinks').find('.add_to_unpopular').clone().css({'float':'left',
                                                                       'margin':'2px 15px 2px 5px',
                                                                       'text-transform':'capitalize',
                                                                      }).appendTo('#brg_TagFavouriteButtons')
            .find('a').css({'background': 'transparent url(http://js.reactor.cc/images/icon_lock.png) no-repeat 0 3px',
                            'padding-left':'16px'
                           });;

        //UNBLOCK TAG
        $('#blogFavroiteLinks').find('.remove_from_unpopular').clone().css({'float':'left',
                                                                            'margin':'2px 15px 2px 5px',
                                                                            'text-transform':'capitalize'
                                                                           }).appendTo('#brg_TagFavouriteButtons')
            .find('a').css({'background': 'transparent url(http://js.reactor.cc/images/icon_unlock.png) no-repeat 0 4px',
                            'padding-left':'16px'
                           });
    }


    function RemoveShareButtons(){
        $('a.share_twitter, a.share_fb, a.share_vk').remove();
    }


    function AddScrollTopButton(){
        let Trigger_Number = 500;
        let SavedPosition = 0;
        $("#pageinner").prepend('<button id="brg_scrollTopButton" class="commentnum toggleComments">↑</button>');

        $( document ).scroll( () => {
            if (SavedPosition){
                ($(document).scrollTop() > Trigger_Number) ? $('#brg_scrollTopButton').text('↑') : $('#brg_scrollTopButton').text('↓');
                return;
            }
            ($(document).scrollTop() > Trigger_Number) ? $('#brg_scrollTopButton').fadeIn( "slow" ) : $('#brg_scrollTopButton').fadeOut( "slow" );
        });

        $('#brg_scrollTopButton').click( () => {
            switch( $('#brg_scrollTopButton').text() ){
                case '↑':
                    SavedPosition = $(document).scrollTop();
                    $(document).scrollTop(0);
                    $('#brg_scrollTopButton').text('↓');
                    break;
                case '↓':
                    $(document).scrollTop(SavedPosition);
                    $('#brg_scrollTopButton').text('↑');
                    break;
            }
        });
    }


    function AddPostButton(){
        $('div.submenuitem:nth-last-of-type(1)').after('<div class="submenuitem"><a id="brg_Addpost" href="" onclick="return false;">Создать новый пост</a></div>');
        $('#brg_Addpost').click( () => $('#add_post_holder').toggle(100) );

        //подгрузить форму создания поста, если ее нет изначально
        if ( !$("#add_post_holder").length ){
            $('<div id="brg_Create"></div>').insertBefore('#post_list');
            $("#brg_Create").load("/all #add_post_holder");
        }
    }


    function AddMenuButton(){
        $('a.top_logo').after('<a id="brg_HideMenus" href="" onclick="return false;" style="margin-left:25px;">Меню</a>');
        $('#brg_HideMenus').click( () => $('#navcontainer, #searchBar').toggle(100) );
    }


    function MoveElements(){
        //SEARCH MOVE
        $('.topbar_inner').append($('#searchmenu'));
        $('#searchmenu').css({ 'marginTop': '3px' });
        $('.post_random').css({ 'float': 'right' });

        //ABYSS LINK MOVE
        let abyss_link = $("#submenu > .submenuitem > a:contains('Бездна')");
        $(".topbar_inner").append(abyss_link);
        $(abyss_link).css({ "marginLeft": "25px" });

        //USER PAGE: COMMENTS LINK MOVE
        if ( ~location.href.indexOf('/user/') ){
            let comments_link = $("#submenu > .submenuitem > a:contains('Комментарии')");
            $(".topbar_inner").append(comments_link);
            $(comments_link).css({ "marginLeft": "25px" });
        }

        //DESCRIPTION(Деменция и фундаментализм и т.д.) MOVE
        let desc = $("#header > div.description");
        $(desc).prependTo('#sidebar');
        $(desc).css({ "border-bottom": "2px solid #FDDA97", "text-align": "center" });
    }


    function RemoveEmptySpace(){
        function checklast(obj){
            let last = $(obj).find(':last');
            if ( $(obj).html().match(/&nbsp;(<\/.{2,6}>)?$/) ){
                let string = $(obj).html();
                let index = string.lastIndexOf('&nbsp;');
                let newString = string.substr(0, index) + string.substr(index + 6);
                $(obj).html(newString);
                console.log('nbsp removed');
                checklast(obj);
                return;
            }
            // СТАРЫЙ ВАРИАНТ
            if ( false && $(obj).html().match(/&nbsp;$/) ){
                let replaced_NBSP = $(obj).html().replace(/&nbsp;$/, '');
                $(obj).html(replaced_NBSP);
                checklast(obj);
                return;
            } else if ( false && $(obj).html().match(/&nbsp;<\//) ){
                let replaced_NBSP = $(obj).html().replace(/&nbsp;<\//, '</');
                $(obj).html(replaced_NBSP);
                checklast(obj);
                return;
            }
            // СТАРЫЙ ВАРИАНТ END
            if ( $(last).is('br, p, span') && !$(last).text().length ){
                $(last).remove();
                console.log('empty tag removed');
                checklast(obj);
                return;
            }
        }
        $("div[id*=postContainer] div.post_content > div").each( (index, element) => checklast(element) );
    }


    function AddNewCSS(NewCssId,NewCssText){
        $("head").append('<style type="text/css" id="'+NewCssId+'">'+NewCssText+'</style>');
    }


    function AddHideCss(){
        AddNewCSS('brg_HideCss',`
#add_post_holder,
#showCreatePost,
#navcontainer,
#searchBar,
#header,
div.mainheader,
/* Скрываем информацию о теге,которая занимает до 500 пикселей */
#tagArticle{
display:none;
}
`);
    }


    function AddMainCss(){
        AddNewCSS('brg_MainCss',`
.comment {
margin-bottom: 2px;
padding: 0px 20px;
border-radius: 15px;
}

/* */
.comments_bottom {
margin-top: -4px;
margin-bottom: -5px;
}

/* Уменьшае высоту конопки "Ответить" в коментах */
.article .ufoot span a.response {
line-height: 25px;
}

.article .ufoot .txt span.comment_rating {
zoom: 80%;
}

/* Закругленные края кнопок */
#blogHeader .add_to_fav a, .pagination a, .pagination span, .pagination .current, .pagination .next, .pagination .prev, .pagination_toggler, input[type="submit"]{
border-radius: 21px;
}

#pageinner {
padding-top: 3px;
}

/* Уменьшаем аватарку */
.avatar {
zoom: 55%;
}

/* Ровняем теги с ником и убираем отступ */
.article .uhead {
height: auto;
margin-bottom: 0px;
}

/* Привязка автарки и ника к левой стороне, отступ перед тегами и серый фон */
div.uhead_nick {
float: left;
margin-right: 5px;
background-color: #e2e2e2;
border-radius: 12px;
padding: 0 5px 0 0;
}

/* Убираем пустоту между постами и добавляем разделитель */
.article {
margin: 0px 0 0px;
border-bottom: 2px solid #FDDA97;
}

/* Добавляем небольшой отступ перед кнопками переключения страниц */
.pagination {
margin-top: 3px;
}

/* Уменьшаем гигантскую кнопку КОММЕНТАРИИ под постом */
.postContainer .ufoot .ufoot_first .comments {
  zoom: 80%;
}

/* Убираем отступ перед кнопкой КОММЕНТАРИИ */
.postContainer .ufoot{
  margin-top: 0;
}

/* Убираем отступ после содержимого поста */
.article .post_content {
  margin-bottom: 0px;
}

/* Опускаем зеленое окошко с количеством новых постов */
.commentnumDelta {
  top:0px;
}
/* Компенсируем увеличивая шрифт */
.commentnum {
  font-size:17px;
}

/* Убираем бесполезный отступ перед и после картинки в посте */
.post_content div,
.post_content .image,
.post_content p {
  padding: 0px 0 0;
  margin: 0 0 0 0;
  margin-top: 0px !important;
}

/* Убираем бесполезный отступ перед и после списка тэгов в посте */
.postContainer .taglist{
  margin: 0 0 0 0;
}

/* Кнопка "Вверх" */
#brg_scrollTopButton,
#brg_scrollBackButton{
display: none;
opacity: 0.85;
position: fixed;
left: inherit;
bottom: 15px;
padding: 200px 10px;
line-height: 0px!important;
height: 0;
width: 35px;
margin-left: -36px;
outline: none;
}
#brg_scrollTopButton:hover,
#brg_scrollBackButton:hover{
opacity: 1;
}

/* Чуть сдвинуть вправо нижнее меню "о проекте", "правила" и т.д. */
#tagList {
margin-left: 2px;
}

/* Для добавления кнопок вперед и назад сверху страницы */
#contentinner,
#post_list {
position: relative;
}

/* Уменьшаем расстояние между кнопкой коментов и кнопкой раскрытия поста. Изначально 10px */
.post_content_expand {
margin-bottom: 1px!important;
}

/* Уменьшаем размер шрифта рейтинга. Изначально 20px */
.post_rating {
font-size: 17px !important;
}
`);
    }

})();
