function Subsonic(endpoint, username, password) {

    var instance = this;

    this.endpoint = endpoint;
    this.username = username;
    this.password = password;
    this.version = '1.11.0';

    this.exec = function(method, userParams, callback) {
        var url = this.createUrl(method, userParams);

        var req = new XMLHttpRequest();
        req.open('GET', url, true);

        req.onreadystatechange = function() {
            if(this.readyState === XMLHttpRequest.UNSENT) {
                alert('Error: ' + this.statusText);
            }
            else if(this.readyState === XMLHttpRequest.DONE) {                
                if(this.status === 200) {
                    var respText = this.response;
                    var respJson = JSON.parse(respText);
                    var data = respJson['subsonic-response'];

                    if(typeof callback === 'function') {
                        callback.apply(instance, [ data ]);
                    }
                }
                else {
                    alert('Error');
                }
            }
        };
        
        req.send();
    };

    // merge default params with request-specific params
    this.createParams = function(userParams) {
        var params = {
            u: this.username,
            p: this.password,
            v: this.version,
            c: 'music',
            f: 'json'
        };

        for(var key in userParams) {
            params[key] = userParams[key];
        }

        return params;
    };

    // create API url from method and request-specific params
    this.createUrl = function(method, userParams) {
        var params = this.createParams(userParams);

        // encode the params part of the URL
        var paramParts = [ ];
        for(var key in params) {
            paramParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }

        var paramsString = paramParts.join('&');

        // create the final url
        var url = this.endpoint + method + '.view?' + paramsString;

        return url;
    };

    function createMethodShortcut(method) {
        function shortcut() {
            var params = null;
            var callback = null;

            for(var i in arguments) {
                var arg = arguments[i];

                if(!callback && typeof arg === 'function') {
                    callback = arg;
                }
                else if(!params && typeof arg === 'object') {
                    params = arg;
                }
            }

            this.exec(method, params, callback);
        };

        return shortcut;
    }

    /* API shortcuts */
    this.getArtists = createMethodShortcut('getArtists');
    this.getAlbumList = createMethodShortcut('getAlbumList');
}

var api = new Subsonic('http://localhost:4040/rest/', 'admin', 'pw');

rivets.configure({
    prefix: 'rv',
    preloadData: true,
    rootInterface: '.',
    templateDelimiters: ['{', '}'],
    handler: function(target, event, binding) {
        this.call(target, event, binding.view.models)
    }
});

var artists = [ ];
rivets.bind($('#side-artists ul'), { artists: artists });


api.getArtists(function(data) {
    console.log(data);
});

api.getAlbumList({ type: 'recent' }, function(data) {
    console.log(data);
});

