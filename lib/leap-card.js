var cheerio = require('cheerio'),
    request = require('request').defaults({
        jar: true,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, sdch',
            'Accept-Language': 'en-US,en;q=0.8,it;q=0.6',
            'Connection': 'keep-alive',
            'Host': 'www.leapcard.ie',
            'Origin': 'https://www.leapcard.ie',
            'Referer': 'https://www.leapcard.ie/en/login.aspx?AspxAutoDetectCookieSupport=1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36'
        }
    }),
    async = require('async'),
    msviewstate = require('ms-viewstate');

var REGEX_CARDS = /<option (?:selected="selected"\s)?value="(\d{6})">(\d{10}) - (.+?)<\/option>/g;
var DETAILS_PREFIX = '#ContentPlaceHolder1_TabContainer2_MyCardsTabPanel_ContentPlaceHolder1_ctrlCardOverViewBODetails_';

var LeapCard = function() {
}

LeapCard.prototype.getCardsInfo = function(username, password, cb) {
    LeapCard.prototype._username = username;
    LeapCard.prototype._password = password;

    async.waterfall([
        this._retrieveLoginPage,
        this._doLogin,
        this._getCardsSummary,
        this._getCardsDetails
    ], cb);
}

LeapCard.prototype._getCardsDetails = function(cards, body, cb) {
    var viewState = msviewstate.extractVs(body)
    var eventValidation = msviewstate.extractEv(body)

    var functions = cards.map(function(card) {
        return LeapCard.prototype._getSingleCardDetails.bind(null, card.id, viewState, eventValidation);
    });

    async.series(functions, function(err, result) {
        if(err) {
            cb(err);
            return;
        }
        cb(result);
    });
};

LeapCard.prototype._getSingleCardDetails = function(id, viewState, eventValidation, cb) {
    request.post({
        url: LeapCard.prototype.options.summaryUrl,
        followAllRedirects: true,
        form: {
            '__VIEWSTATE': viewState,
            '__EVENTVALIDATION': eventValidation,
            '__EVENTTARGET': 'ctl00$ctl00$ContentPlaceHolder1$TabContainer2$MyCardsTabPanel$ddlMyCardsList',
            '__EVENTARGUMENT': '',
            'ctl00$ctl00$AjaxScriptManager': 'tl00$ctl00$ContentPlaceHolder1$TabContainer2$MyCardsTabPanel$UpdatePanel1|ctl00$ctl00$ContentPlaceHolder1$TabContainer2$MyCardsTabPanel$ddlMyCardsList',
            'ContentPlaceHolder1_TabContainer2_ClientState': '{"ActiveTabIndex":0,"TabState":[true,true]}',
            '__SCROLLPOSITIONX': '0',
            '__SCROLLPOSITIONY': '0',
            'ctl00$ctl00$ContentPlaceHolder1$TabContainer2$MyCardsTabPanel$ddlMyCardsList': id,
            '__ASYNCPOST': 'true'
        }
    }, function(err, response, body) {
        if(err) {
            cb(err);
            return;
        }

        request.get(LeapCard.prototype.options.summaryUrl, function (error, response, body) {
            if(error) {
                cb(error);
                return;
            }
            if(response.statusCode !== 200) {
                cb(new Error('Got a '+response.statusCode));
                return;
            }

            $ = cheerio.load(body);

            var cardNumber = $(DETAILS_PREFIX+'lblCardNumber').parent().contents().eq(2).text().trim();
            var cardLabel = $(DETAILS_PREFIX+'lblCardLabel').parent().contents().eq(2).text().trim();
            var cardProfile = $(DETAILS_PREFIX+'lblCardProfile').parent().contents().eq(2).text().trim();
            var cardStatus = $(DETAILS_PREFIX+'AccessibleLabel2').parent().contents().eq(2).text().trim();
            var cardCreditStatus = $(DETAILS_PREFIX+'Label1').parent().contents().eq(2).text().trim();
            var cardAutoTopUp = $(DETAILS_PREFIX+'Label2').parent().contents().eq(2).text().trim();
            var cardInitDate = $(DETAILS_PREFIX+'AccessibleLabel4').parent().contents().eq(2).text().trim();
            var cardExpiryDate = $(DETAILS_PREFIX+'AccessibleLabel5').parent().contents().eq(2).text().trim();
            var cardBalance = $(DETAILS_PREFIX+'lblTravelCreditBalance').parent().contents().eq(2).text().trim();

            cb(null, {
                number: cardNumber,
                label: cardLabel,
                profile: cardProfile,
                status: cardStatus,
                creditStatus: cardCreditStatus,
                autoTopUp: cardAutoTopUp,
                initDate: cardInitDate,
                expiryDate: cardExpiryDate,
                balance: cardBalance
            });

        });

    });
}

LeapCard.prototype._getCardsSummary = function(body, cb) {

    var results = [];

    var search;
    while ((search = REGEX_CARDS.exec(body)) !== null) {
        results.push({
            id: search[1],
            cardId: search[2],
            name: search[3]
        });
    }
    cb(null, results, body);
}

LeapCard.prototype._doLogin = function(body, cb) {
    var viewState = msviewstate.extractVs(body)
    var eventValidation = msviewstate.extractEv(body)

    request.post({
        url: LeapCard.prototype.options.loginUrl,
        followAllRedirects: true,
        qs: {
            'AspxAutoDetectCookieSupport': '1'
        },
        form: {
            '__VIEWSTATE': viewState,
            '__EVENTVALIDATION': eventValidation,
            //'__PREVIOUSPAGE': 'y2GBSfIbmifdTMHZo_m_YW7AE9Fcqv89Bt67xW-85p2_OBshKNpWeqZFv0jRyg-e-kFSgwKeUQGgtX5XTV5-9nSE55G7w8FNywN3F_mWRk01',
            'ctl00$ContentPlaceHolder1$Password': LeapCard.prototype._password,
            'ctl00$ContentPlaceHolder1$UserName': LeapCard.prototype._username,
            'ctl00$ContentPlaceHolder1$btnlogin': 'Login',
            'ctl00$ucSiteSearch$txtSearch': '',
            'AjaxScriptManager_HiddenField': '',
            '_URLLocalization_Var001': 'False',
            '__EVENTTARGET': '',
            '__EVENTARGUMENT': '',
            '__SCROLLPOSITIONX': '0',
            '__SCROLLPOSITIONY': '300'
        }
    }, function(err, response, body) {
        if(err) {
            cb(err);
            return;
        }
        cb(null, body);
    });
}


LeapCard.prototype._retrieveLoginPage = function(cb) {
    request.get(LeapCard.prototype.options.loginUrl, function (error, response, body) {
        if(error) {
            cb(error);
            return;
        }
        if(response.statusCode !== 200) {
            cb(new Error('Got a '+response.statusCode));
            return;
        }
        cb(null, body);
    });
}



LeapCard.prototype.leapcard = '[leapcard object]';

LeapCard.prototype.options = {
    loginUrl: 'https://www.leapcard.ie/en/login.aspx',
    summaryUrl: 'https://www.leapcard.ie/en/SelfServices/CardServices/CardOverView.aspx'
};

module.exports = new LeapCard();
