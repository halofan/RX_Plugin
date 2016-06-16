const GOOGLE_SEARCH_URL = 'https://www.google.pl/search?ie=UTF-8#q=site:http:%2F%2Fwww.garsoniera.com.pl+';
const GARSO_SEARCH_URL = 'http://www.garsoniera.com.pl/forum/index.php?app=core&module=search&do=search&fromMainBar=1&search_app=forums&search_term=';
const INACTIVE_CLASS = 'inactive';

chrome.storage.local.get("new_limiter", function (a) {
    var _new_limiter = a.new_limiter;

    var _showAll = $("a.show_all.jqtooltip");
    if (_showAll.length > 0) {
        _showAll.html(_showAll.html() + "<b> (wybierz, aby aktywować RX Plugin)</b>");
    }

    var _phoneElem = $("span.dane_anonsu_tytul.dane_anonsu_tel");
    if (_phoneElem.length > 0) {
        _phoneElem.css("cursor", "pointer");
        var _phoneNumber = _phoneElem[0].innerText.trim().split(" ").join("-");
        var _id;
        var _idElem = $("a.colorbox");
        if (_idElem.length > 0) {
            _id = $(_idElem[0]).attr("href").split("nr=")[1];
        }
        $(_phoneElem).bind("click", function(e){
            e.preventDefault();
            if (_phoneNumber != null) {
                window.open(GOOGLE_SEARCH_URL + _phoneNumber);
            }

            chrome.storage.local.get("searchById", function(a) {
                if (_id != null && a.searchById) {
                    window.open(GARSO_SEARCH_URL + "\"" + _id + "\"");
                }
            });
        })
    }

    sortAnons(_new_limiter);
});

function Diva() {
    this.id = null;
    this.name = null;
    this.favorite = false;
    this.ignored = false;
    this.new = true;
    this.newCounter = 1;
    this.phone = null;
}

Diva.prototype.getInfo = function () {
    return "ID: " + this.id + ", name: " + this.name;
};

function getDiwaFromElem(elem) {
    var _jqElem = $(elem);
    var _diva = new Diva();

    var _divWrap = _jqElem.find('div.random_item');
    _diva.phone = _divWrap.attr('data-keyword').split(",")[1];

    var _imgElem = _jqElem.find("img:not('.videoimg')");
    _diva.id = _imgElem.attr('id').replace('an_', '');
    _diva.name = _imgElem.attr('alt');
    return _diva;
}

function favHandler(el, diva, ignoreElem) {
    diva.favorite = !diva.favorite;
    $(el).toggleClass(INACTIVE_CLASS);
    if (diva.favorite) {
        diva.ignored = false;
        $(ignoreElem).addClass(INACTIVE_CLASS);
    }

    var _diwaSaveObj = {};
    _diwaSaveObj[diva.id] = diva;
    chrome.storage.local.set(_diwaSaveObj);
}

function ignoreHandler(el, diva, favElem) {
    diva.ignored = !diva.ignored;
    $(el).toggleClass(INACTIVE_CLASS);
    if (diva.ignored) {
        diva.favorite = false;
        $(favElem).addClass(INACTIVE_CLASS);
    }

    var _diwaSaveObj = {};
    _diwaSaveObj[diva.id] = diva;
    chrome.storage.local.set(_diwaSaveObj);
}

function setUpIcons(elem, diwa) {
    var _favIconPath = chrome.extension.getURL('img/fav.png');
    var _newIconPath = chrome.extension.getURL('img/new.png');
    var _ignoreIconPath = chrome.extension.getURL('img/ignore.png');

    var _jqElem = $(elem);
    _jqElem.css("position", "relative");

    var _favIconElem = document.createElement("img");
    _favIconElem.src = _favIconPath;
    _favIconElem.className = "fav_icon " + (diwa.favorite ? "" : INACTIVE_CLASS);

    var _ignoreIconElem = document.createElement("img");
    _ignoreIconElem.src = _ignoreIconPath;
    _ignoreIconElem.className = "ignore_icon " + (diwa.ignored ? "" : INACTIVE_CLASS);

    _favIconElem.addEventListener('click', function (e) {
        e.preventDefault();
        favHandler(this, diwa, _ignoreIconElem);
    });

    _ignoreIconElem.addEventListener('click', function (e) {
        e.preventDefault();
        ignoreHandler(this, diwa, _favIconElem);
    });

    _jqElem.append(_favIconElem);
    _jqElem.append(_ignoreIconElem);
    if (diwa.new) {
        _jqElem.append("<img class='new_icon' src='" + _newIconPath + "'>");
    }
}

function setUpPhone(elem, diwa) {
    var _divPodpis = $(elem).find("div.podpis");
    var _phoneNumber = diwa.phone;
    if (_phoneNumber != null && _phoneNumber.length == 9) {
        _phoneNumber = _phoneNumber.match(/.{1,3}/g).join("-");

        var _phoneElem = document.createElement("span");
        _phoneElem.innerText = _phoneNumber;
        _phoneElem.addEventListener('click', function (e) {
            e.preventDefault();
            if (_phoneNumber != null) {
                window.open(GOOGLE_SEARCH_URL + _phoneNumber);
            }
            chrome.storage.local.get("searchById", function(a) {
                if (diwa.id != null && a.searchById) {
                    window.open(GARSO_SEARCH_URL + "\"" + diwa.id + "\"");
                }
            });
        });

        _divPodpis.append(_phoneElem);
    }
}

function getPhoneAsInt(phone) {
    return parseInt(phone.split("-").join(""));
}

function getRandomColor() {
    var _letters = '0123456789ABCDEF'.split('');
    var _color = '#';
    for (var i = 0; i < 6; i++) {
        _color += _letters[Math.floor(Math.random() * 16)];
    }
    return _color;
}

function calculatePriority(array, anonsMap) {
    var _color = '#FFF';
    var _fav = false;
    var _new = false;
    var _ignored = false;
    if (array.length > 1) {
        _color = getRandomColor();
    }
    for (var i = 0; i < array.length; i++) {
        var _jqElem = $(array[i]);
        _jqElem.css("background-color", _color);
        var _diva = anonsMap.get($(_jqElem).attr("data-id"));

        if (_diva.favorite) {
            _fav = true;
        }
        if (_diva.new) {
            _new = true;
        }
        if (_diva.ignored) {
            _ignored = true;
        }
    }
    if (_fav) {
        return 2;
    } else if (_new) {
        return 1;
    } else if (_ignored) {
        return -1;
    }

    return 0;
}

function sortAnons(NEW_LIMITER) {
    var _divaElems = $('#anons_group').find('a');

    if (_divaElems.length > 0) {
        var _anonsMap = new Map();
        var _p1 = new Promise(function (resolve, reject) {
            _divaElems.each(function (index, divaElem) {
                var _diva = getDiwaFromElem(divaElem);
                chrome.storage.local.get(_diva.id, function (re) {
                    if (re[_diva.id] != null) {
                        _diva.favorite = re[_diva.id].favorite;
                        _diva.new = re[_diva.id].new;
                        _diva.newCounter = re[_diva.id].newCounter;
                        _diva.ignored = re[_diva.id].ignored;
                    }
                    if (_diva.newCounter > NEW_LIMITER) {
                        _diva.new = false;
                    }
                    setUpIcons(divaElem, _diva);
                    setUpPhone(divaElem, _diva);

                    $(divaElem).attr("data-id", _diva.id);

                    _diva.newCounter += 1;
                    var _diwaSaveObj = {};
                    _diwaSaveObj[_diva.id] = _diva;
                    _anonsMap.set(_diva.id, _diva);
                    chrome.storage.local.set(_diwaSaveObj);
                    if (index == _divaElems.length - 1) {
                        resolve(0);
                    }
                });
            });
        });

        _p1.then(function (val) {
            var _grouped = {};

            _divaElems.each(function(idx, div) {
                var _diva = _anonsMap.get($(div).attr("data-id"));
                var i = getPhoneAsInt(_diva.phone);
                if (_grouped[i] == null) {
                    _grouped[i] = [div];
                } else {
                    _grouped[i].push(div);
                }
            });

            var _arr = Object.keys(_grouped).map(function (key) {
                return _grouped[key];
            });

            _arr.sort(function(a, b) {
                return calculatePriority(b, _anonsMap) - calculatePriority(a, _anonsMap);
            });

            var _merged = [].concat.apply([], _arr);
            $("#anons_group").append(_merged);

        }).catch(function (reason) {
        });
    }
}